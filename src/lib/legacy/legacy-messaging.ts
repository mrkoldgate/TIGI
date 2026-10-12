// Client-safe copy for the Legacy module (no database imports).

// ── Messaging constants ────────────────────────────────────────────────────

export const LEGACY_MESSAGING = {
  /** Module title */
  moduleTitle: 'Legacy Planning',

  /** One-line description */
  shortDescription:
    'A structured tool to record your estate preferences and beneficiary instructions.',

  /** Shown at the top of the Legacy wizard */
  disclaimer:
    'This is a structured planning tool to help you record your preferences and organize ' +
    'your estate instructions. It is not a final legal instrument or a substitute for a ' +
    'formal will or trust. We recommend consulting a qualified estate planning attorney ' +
    'for legally binding documents.',

  /** CTA for starting the wizard */
  startCta: 'Set Up Legacy Plan',

  /** Shown after submission */
  submittedMessage:
    'Your legacy preferences have been submitted for review. ' +
    'Our compliance team will be in touch within 2–3 business days.',

  /** Shown when plan is ACTIVE */
  activeMessage:
    'Your legacy preferences are on file. You can update them at any time.',

  /** Short label for beneficiary allocation */
  allocationLabel: 'Allocation %',

  /** Compliance note shown on review step */
  complianceNote:
    'Not a legal will or binding contract. Your preferences are recorded and stored ' +
    'securely but require formal legal instruments for enforceability.',
} as const
