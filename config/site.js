// Switches that Content's settings do not carry (Design's names, spec 14 item 6).
// Defaults as the spec states them; flip one to remove a study or a hint.
export const siteConfig = {
  // The hint line above the demo toolbar in the Generated state (bet B4).
  preStep: true,
  // A study renders only when its status allows AND its flag is true.
  // AS-08: the payments study needs the owner's consent; the owner confirms at the merge.
  showStudy: {
    "arsididi-admin": true,
    "arsididi-student": true,
    "command-center": true,
    "cake-studio": true,
    "payments-webhooks": true,
  },
};
