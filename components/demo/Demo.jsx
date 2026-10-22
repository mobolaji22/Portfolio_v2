import FinishingDemo from "./FinishingDemo";
import TagChips from "../TagChips";
import { c, byVoice, typo, settings } from "@/lib/content";
import { source } from "@/lib/demo-fixture";
import { diff } from "@/lib/demo-model";
import { measured, contrastLine } from "@/lib/contrast";

// Server wrapper: reads the demo copy by key, builds every figure from the fixture (N8), passes plain data.
export default function Demo() {
  const d = c.demo;
  const tokens = diff(source);
  const copy = {
    regionLabel: d.regionLabel, dashboardTitle: d.dashboardTitle, controls: d.controls,
    states: { ...d.states, ...c.states }, labels: d.dashboardLabels, defects: d.defects,
    notes: d.designedNotes, contrast: { light: contrastLine(measured.light), dark: contrastLine(measured.dark) }, noJs: d.noJs, reducedMotion: d.reducedMotion,
    a11y: c.a11y, hero: { preStep: c.hero.preStep }, preStep: settings.preStep !== false,
  };
  // noJs.body states two figures in prose: rebuild them from the fixture and fail the build if the sentence changes
  const re = /reading (\d+) where the source holds (\d+)/;
  if (!re.test(d.noJs.body)) throw new Error("demo.noJs.body no longer matches the expected sentence");
  const noJsBody = typo(d.noJs.body.replace(re, `reading ${tokens.membersShown} where the source holds ${tokens.membersHeld}`));
  return (
    <FinishingDemo
      copy={copy} tokens={tokens} source={source}
      credit={byVoice(d.credit)} designCredit={byVoice(d.designCredit)} noJsBody={noJsBody}
      chips={<TagChips claims={d.claims} />}
    />
  );
}
