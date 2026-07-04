"""
Managed Service for Apache Spark job scaffold for CyVix.

Reads civic feeds from BigQuery, engineers ward-level features, and writes anomaly
signals back to a curated table for downstream Looker and ADK consumption.
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, stddev_pop, when


def build_session() -> SparkSession:
    return (
        SparkSession.builder.appName("CyVixSparkJob")
        .config("spark.sql.session.timeZone", "UTC")
        .getOrCreate()
    )


def main() -> None:
    spark = build_session()
    source = (
        spark.read.format("bigquery")
        .option("table", "gcp-apac-501407.cyvix_demo.scenario_baselines")
        .load()
    )

    features = (
        source.groupBy("ward", "domain")
        .agg(
            avg("risk_score").alias("avg_risk_score"),
            stddev_pop("risk_score").alias("risk_stddev")
        )
        .withColumn(
            "alert_band",
            when(col("avg_risk_score") >= 80, "critical")
            .when(col("avg_risk_score") >= 70, "elevated")
            .otherwise("watch")
        )
    )

    (
        features.write.format("bigquery")
        .option("table", "gcp-apac-501407.cyvix_demo.spark_feature_summary")
        .mode("overwrite")
        .save()
    )


if __name__ == "__main__":
    main()

