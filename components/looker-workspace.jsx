"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Database, ExternalLink } from "lucide-react";

export function LookerWorkspace({
  lookerStatus,
  platformLive,
  demoInitState,
  onDemoInit,
  comparisonWard,
  setComparisonWard,
  scenarios,
  scenario,
  comparisonScenario,
  lookerTab,
  setLookerTab,
  lookerTabs,
  lookerSlicers,
  lookerMetrics,
  lookerSignals,
  trendRows,
  activeRecommendation,
  comparisonDelta,
  lookerGeneratedAt
}) {
  const [activeSlicer, setActiveSlicer] = useState(lookerSlicers[0]?.label ?? "Region");

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      className="rounded-[32px] border-[3px] border-black bg-[#f7f2e8] p-5 shadow-[12px_12px_0_0_#111] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-ink-muted">
            Operations workspace
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-black tracking-[-0.06em] text-ink">
            {lookerStatus.title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            {lookerStatus.live
              ? "Connected to a live report URL and surfaced in the same product shell."
              : "A production-style workspace keeps the leadership view concrete even before a report URL is configured."}
          </p>
        </div>
        <div
          className={`rounded-full border-[3px] border-black px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_0_#111] ${
            lookerStatus.live ? "bg-[#a7f3d0] text-ink" : "bg-[#ffe98a] text-ink"
          }`}
        >
          {lookerStatus.status === "connected" ? "Connected" : "Preview"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Dashboard", value: lookerStatus.title },
          { label: "Report", value: lookerStatus.live ? "Live URL" : "Shell preview" },
          { label: "Live data", value: platformLive.bigquery ? "Connected" : "Ready" }
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[22px] border-[3px] border-black bg-white p-4 shadow-[6px_6px_0_0_#111]"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-muted">
              {item.label}
            </p>
            <p className="mt-2 text-sm font-black tracking-[-0.03em] text-ink">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[28px] border-[3px] border-black bg-white p-4 shadow-[8px_8px_0_0_#111]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-faint">
              Operational frame
            </p>
            <p className="mt-1 text-sm leading-6 text-ink-soft">
              Ward-level summaries, trend deltas, and a current decision packet.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#f7f2e8] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-ink shadow-[4px_4px_0_0_#111]"
            onClick={onDemoInit}
            disabled={demoInitState.loading}
          >
            {demoInitState.loading ? "Initializing..." : "Initialize demo data"}
            <Database className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[220px_1fr]">
          <aside className="rounded-[24px] border-[3px] border-black bg-[#f7f2e8] p-3 shadow-[6px_6px_0_0_#111]">
            <div className="rounded-[20px] border-[3px] border-black bg-white px-3 py-2 shadow-[4px_4px_0_0_#111]">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-muted">
                Slicers
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {lookerSlicers.map((slicer) => (
                <button
                  key={slicer.label}
                  type="button"
                  onClick={() => setActiveSlicer(slicer.label)}
                  className="flex w-full items-center justify-between gap-3 rounded-[18px] border-[3px] border-black bg-white px-3 py-3 text-left shadow-[4px_4px_0_0_#111]"
                >
                  <span>
                    <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-ink-muted">
                      {slicer.label}
                    </span>
                    <span className="mt-1 block text-sm font-black tracking-[-0.03em] text-ink">
                      {slicer.value}
                    </span>
                  </span>
                  <span
                    className={`rounded-full border-[2px] border-black px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-ink ${
                      activeSlicer === slicer.label ? "bg-[#a7f3d0]" : "bg-white"
                    }`}
                  >
                    {activeSlicer === slicer.label ? "Active" : "Set"}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-[18px] border-[3px] border-black bg-[#2f6bff] p-3 text-white shadow-[4px_4px_0_0_#111]">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
                Comparison ward
              </p>
              <div className="mt-2">
                <label className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
                  Compare against
                </label>
                <select
                  value={comparisonWard}
                  onChange={(event) => setComparisonWard(event.target.value)}
                  className="mt-2 w-full rounded-full border-[3px] border-black bg-white px-3 py-2 text-sm font-black text-ink outline-none shadow-[4px_4px_0_0_#111]"
                >
                  {scenarios.map((item) => (
                    <option key={item.ward} value={item.ward}>
                      {item.ward}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/80">
                Compare {scenario.ward} with {comparisonScenario.ward} to show a live delta.
              </p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-white/70">
                Filter focus: {activeSlicer}
              </p>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {lookerTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLookerTab(tab.id)}
                  className={`rounded-full border-[3px] border-black px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[4px_4px_0_0_#111] transition ${
                    lookerTab === tab.id ? "bg-[#2f6bff] text-white" : "bg-white text-ink-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <div className="ml-auto rounded-full border-[3px] border-black bg-[#a7f3d0] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[4px_4px_0_0_#111]">
                {platformLive.bigquery ? "Data connected" : "Data ready"}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {lookerMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[22px] border-[3px] border-black bg-[#0e1b2b] p-4 text-white shadow-[6px_6px_0_0_#111]"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.05em]">{metric.value}</p>
                  <p className="mt-2 text-xs leading-5 text-white/70">{metric.note}</p>
                </div>
              ))}
            </div>

            <motion.div
              key={lookerTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-[28px] border-[3px] border-black bg-[#0e1b2b] p-4 text-white shadow-[8px_8px_0_0_#111]"
            >
              {lookerTab === "summary" ? (
                <div className="grid gap-4 lg:grid-cols-[0.56fr_0.44fr]">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/60">
                          Executive snapshot
                        </p>
                        <h4 className="mt-1 text-xl font-black tracking-[-0.04em]">
                          Dashboard snapshot
                        </h4>
                      </div>
                      <div className="rounded-full border-[3px] border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white">
                        {platformLive.bigquery ? "Data connected" : "Demo source"}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-12 gap-2">
                      {scenario.chart.slice(-8).map((value, index) => (
                        <div key={`${scenario.id}-${index}`} className="col-span-1 flex h-32 items-end">
                          <div
                            className="w-full rounded-t-full border-[2px] border-white/70 bg-[#8bd3ff]"
                            style={{ height: `${Math.max(24, value * 100)}%` }}
                          />
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/82">
                      {lookerStatus.live
                        ? "The leadership view can open directly from this surface with the same ward filter context preserved."
                        : "This workspace mirrors a live reporting experience: filters, a KPI ribbon, and drill-down navigation are already in place."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        label: "Live data",
                        value: platformLive.bigquery ? "Connected" : "Ready",
                        tone: "bg-[#a7f3d0]"
                      },
                      {
                        label: "Response lane",
                        value: activeRecommendation.responseWindow,
                        tone: "bg-[#ffe98a]"
                      },
                      {
                        label: "Metric owner",
                        value: scenario.tag,
                        tone: "bg-[#ff9fb0]"
                      }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-[22px] border-[3px] border-white/15 ${item.tone} p-4 text-ink shadow-[5px_5px_0_0_#111]`}
                      >
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-muted">
                          {item.label}
                        </p>
                        <p className="mt-2 text-lg font-black tracking-[-0.04em]">{item.value}</p>
                      </div>
                    ))}

                    <div className="rounded-[22px] border-[3px] border-white/15 bg-white/6 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/60">
                        Refresh
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/82">
                        {lookerGeneratedAt
                          ? `Last synced from the demo manifest at ${new Date(lookerGeneratedAt).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit"
                            })}.`
                          : "Connected to the current scenario context and ready to refresh."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {lookerTab === "drilldown" ? (
                <div className="grid gap-4 lg:grid-cols-[0.4fr_0.6fr]">
                  <div className="space-y-3">
                    <div className="rounded-[22px] border-[3px] border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
                        Signal depth
                      </p>
                      <div className="mt-3 space-y-3">
                        {lookerSignals.map((signal, index) => (
                          <div key={signal.name} className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/55">
                                  Signal {index + 1}
                                </p>
                                <p className="mt-1 text-sm font-black tracking-[-0.03em] text-white">
                                  {signal.name}
                                </p>
                              </div>
                              <div className={`rounded-full border-[2px] border-black px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-ink shadow-[3px_3px_0_0_#111] ${signal.tone}`}>
                                {Math.round(signal.value * 100)}%
                              </div>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                              <div
                                className="h-full rounded-full bg-[#8bd3ff]"
                                style={{ width: `${Math.max(24, signal.value * 100)}%` }}
                              />
                            </div>
                            <p className="mt-2 text-xs leading-5 text-white/72">
                              {signal.note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[22px] border-[3px] border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
                        Ward comparison
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/82">
                        {scenario.ward} vs {comparisonScenario.ward}
                      </p>
                      <div className="mt-3 rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
                            Risk delta
                          </span>
                          <span className={`rounded-full border-[2px] border-black px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-ink shadow-[3px_3px_0_0_#111] ${comparisonDelta >= 0 ? "bg-[#ff9fb0]" : "bg-[#a7f3d0]"}`}>
                            {comparisonDelta >= 0 ? "+" : ""}
                            {comparisonDelta}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-white/72">
                          The comparison ward is {comparisonDelta >= 0 ? "higher" : "lower"} than the current ward by {Math.abs(comparisonDelta)} risk points.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-[22px] border-[3px] border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
                        Trend over time
                      </p>
                      <div className="mt-3 overflow-hidden rounded-[18px] border-[2px] border-white/10">
                        <table className="w-full border-collapse text-left">
                          <thead className="bg-white/8">
                            <tr>
                              <th className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/60">
                                Period
                              </th>
                              <th className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/60">
                                Risk
                              </th>
                              <th className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/60">
                                Delta
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {trendRows.map((row) => (
                              <tr key={row.period} className="border-t border-white/10">
                                <td className="px-3 py-3 text-sm font-black text-white">{row.period}</td>
                                <td className="px-3 py-3 text-sm text-white/85">{row.signal}</td>
                                <td className="px-3 py-3 text-sm text-white/75">{row.delta}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="rounded-[22px] border-[3px] border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
                        Mini table
                      </p>
                      <div className="mt-3 overflow-hidden rounded-[18px] border-[2px] border-white/10">
                        <table className="w-full border-collapse text-left">
                          <thead className="bg-white/8">
                            <tr>
                              <th className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/60">
                                Metric
                              </th>
                              <th className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/60">
                                This ward
                              </th>
                              <th className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/60">
                                Compare
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ["Risk", scenario.riskScore, comparisonScenario.riskScore],
                              ["Confidence", `${Math.round(scenario.confidence * 100)}%`, `${Math.round(comparisonScenario.confidence * 100)}%`],
                              ["Window", scenario.responseWindow, comparisonScenario.responseWindow]
                            ].map(([metric, current, compare]) => (
                              <tr key={metric} className="border-t border-white/10">
                                <td className="px-3 py-3 text-sm font-black text-white">{metric}</td>
                                <td className="px-3 py-3 text-sm text-white/85">{current}</td>
                                <td className="px-3 py-3 text-sm text-white/75">{compare}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {lookerTab === "alerts" ? (
                <div className="grid gap-4 lg:grid-cols-[0.48fr_0.52fr]">
                  <div className="rounded-[22px] border-[3px] border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
                      Alert routing
                    </p>
                    <div className="mt-3 space-y-3">
                      {scenario.workflow.map((item, index) => (
                        <div key={item.step} className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black tracking-[-0.03em] text-white">
                              {item.step}
                            </p>
                            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white/55">
                              {index + 1}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-white/72">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-[22px] border-[3px] border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
                        Publish status
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/82">
                        {demoInitState.result?.storage?.connected
                          ? "The demo initializer can write the bundle remotely and seed the baseline in one pass."
                          : "The initializer shows how a real operator would seed the baseline and generate the same manifest for the workspace."}
                      </p>
                    </div>

                    <div className="rounded-[22px] border-[3px] border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
                        Report action
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/82">
                        {lookerStatus.dashboardUrl
                          ? "Open the linked report for a live leadership view."
                          : "Connect a report URL to turn this preview into a live workspace."}
                      </p>
                      {lookerStatus.dashboardUrl ? (
                        <a
                          href={lookerStatus.dashboardUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-2 rounded-full border-[3px] border-white bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-ink shadow-[4px_4px_0_0_#111]"
                        >
                          Open report
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                platformLive.bigquery ? "Data live" : "Data ready",
                platformLive.storage ? "Storage live" : "Storage ready",
                platformLive.cloudRun ? "App live" : "App ready",
                lookerStatus.live ? "Report linked" : "Report preview"
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border-[3px] border-black bg-[#a7f3d0] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_0_#111]"
                >
                  {chip}
                </span>
              ))}
            </div>

            {demoInitState.result ? (
              <div className="mt-4 rounded-[24px] border-[3px] border-black bg-[#ffe98a] p-4 shadow-[6px_6px_0_0_#111]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-muted">
                  Demo initializer
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Seeded {demoInitState.result.manifest?.scenarioCount ?? 0} scenarios,{" "}
                  {demoInitState.result.bigquery?.connected ? "wrote rows to the baseline store" : "kept the seed local"},{" "}
                  and {demoInitState.result.storage?.connected ? "stored the demo bundle remotely." : "left the bundle local."}
                </p>
              </div>
            ) : null}

            {lookerStatus.dashboardUrl ? (
              <a
                href={lookerStatus.dashboardUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#2f6bff] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[6px_6px_0_0_#111]"
              >
                Open report
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
