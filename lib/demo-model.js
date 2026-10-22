// The fixture and the two readers (spec 5.2). The defects are real mismatches between what
// each reader asks of the source and what the source holds, not a script (N8, CL-03).
// Reads the way the flawed screen did. members: a key the source never sends, a default turns
// undefined into 0. chart: a key that does not exist, so it receives [] and draws nothing,
// raising no error. The card labelled Resolved reads the field named closed.
export function readAsGenerated(src) {
  return {
    members: src.members ?? 0,
    series: src.signups ?? [],
    open: src.tickets.open,
    resolved: src.tickets.closed,
  };
}

export function readAsChecked(src) {
  return {
    members: src.activeMembers,
    series: src.signupsByWeek,
    open: src.tickets.open,
    resolved: src.tickets.resolved,
    closed: src.tickets.closed,
  };
}

// Every readout, announcement and the no-JS text is built from these tokens (N8).
export function diff(src) {
  const g = readAsGenerated(src);
  const k = readAsChecked(src);
  const s = k.series;
  return {
    membersShown: g.members,
    membersHeld: k.members,
    seriesShown: g.series.length,
    seriesCount: s.length,
    seriesMin: Math.min(...s),
    seriesMax: Math.max(...s),
    seriesFirst: s[0],
    seriesLast: s[s.length - 1],
    resolvedShown: g.resolved,
    resolvedHeld: k.resolved,
    closedHeld: k.closed,
    openHeld: k.open,
  };
}

// The y domain of the Designed chart is [0, niceCeil(max)]; an honest zero baseline.
export const niceCeil = (max) => Math.ceil(max / 10) * 10;
