// Who is using the tool changes the words, the questions asked and what the results lead with.
// Same house rules as copy.ts. Dollar figures are the visitor's own or published with a source; never invented.
import type { FixId, Inputs } from '../engine/types.ts'

export type Role = 'engineer' | 'security' | 'compliance' | 'executive' | 'board'

export const roles: { value: Role; label: string; hint: string }[] = [
  { value: 'engineer', label: 'Network engineer or architect', hint: 'Show me the paths, zones and fixes' },
  { value: 'security', label: 'Security lead', hint: 'Threats, controls and detection' },
  { value: 'compliance', label: 'Risk and compliance', hint: 'Obligations, deadlines and evidence' },
  { value: 'executive', label: 'Executive', hint: 'Business impact, cost and what to fund' },
  { value: 'board', label: 'Board member', hint: 'Accountability and what to ask management' },
]

export const roleLabel = (r: Role) => roles.find((x) => x.value === r)!.label

/** Technical roles see network terms; the others see plain English. */
export const isPlain = (r: Role) => r === 'compliance' || r === 'executive' || r === 'board'

/** Executives and directors answer a short set; the rest keep the typical answer. */
export const SHORT_SET: (keyof Inputs)[] = ['mgmtSeparation', 'privilegedAuth', 'vendorAccess', 'edgePatching', 'apiExposure', 'logging', 'irPlan', 'changeProcess']
export const asksAll = (r: Role) => r === 'engineer' || r === 'security' || r === 'compliance'

export const picker = {
  title: 'First, who are you?',
  sub: 'We will ask the questions you can answer, in your words, and show the results you need to report on.',
}

export const plainNotSure = { label: 'I would need to ask my team', hint: 'We assume the riskier answer' }
export const assumedTypical = 'Assumed typical'

type PlainQ = { label: string; helper: string; options?: Record<string, { label: string; hint?: string }> }
/** Plain-English versions of the questions, for non-technical roles. */
export const plainQuestions: Partial<Record<keyof Inputs, PlainQ>> = {
  mgmtSeparation: {
    label: 'Could someone who gets into your office IT reach the systems that run the network?',
    helper: 'For example, after a staff member is tricked by a fake email.',
    options: {
      shared: { label: 'Yes, they are connected' },
      firewalled: { label: 'There is a barrier, but admins can cross it' },
      dedicated_oob: { label: 'No, they are fully separate' },
    },
  },
  mgmtSegmentation: {
    label: 'If one admin account were misused, how much of the network could it reach?',
    helper: 'Your team will know whether access is limited to what each person needs.',
    options: {
      flat: { label: 'All of it' },
      by_domain: { label: 'One part of it' },
      per_asset: { label: 'Only what that person is approved for' },
    },
  },
  liIsolation: {
    label: 'Are the systems that support interception warrants kept separate from everything else?',
    helper: 'Sometimes called lawful intercept.',
    options: { shared: { label: 'No' }, separate: { label: 'Yes, with strict access' } },
  },
  siteOt: {
    label: 'Are power and cooling at your exchanges and data centres on the office network?',
    helper: 'Batteries, generators, air conditioning and building controls.',
    options: { on_corporate: { label: 'Yes' }, on_management: { label: 'On the network management systems' }, isolated: { label: 'No, kept separate' } },
  },
  privilegedAuth: {
    label: 'How do staff and suppliers prove who they are when they sign in?',
    helper: 'Especially people with powerful access.',
    options: {
      password: { label: 'Just a password' },
      mfa_app: { label: 'Password plus a code on their phone', hint: 'Can still be tricked' },
      phishing_resistant: { label: 'Security keys or passwordless', hint: 'Very hard to trick' },
    },
  },
  vendorAccess: {
    label: 'How do outside suppliers get into your network for support?',
    helper: 'Equipment vendors and managed service providers.',
    options: {
      always_on: { label: 'They can log in any time' },
      on_request: { label: 'Only when we approve it' },
      brokered: { label: 'Approved, limited and recorded each time' },
    },
  },
  vendorCount: { label: 'Roughly how many outside suppliers can log in remotely?', helper: 'A rough count is fine.' },
  sharedAccounts: { label: 'Do any people share the same powerful login?', helper: 'For example, one admin login used by a whole team or supplier.' },
  edgePatching: {
    label: 'How quickly are security updates applied to your internet-facing equipment?',
    helper: 'Routers, firewalls and remote access devices.',
    options: { behind: { label: 'Often months behind' }, mostly: { label: 'Mostly up to date' }, current: { label: 'Within weeks' } },
  },
  apiExposure: {
    label: 'Do you know every online service that can return customer details?',
    helper: 'Websites, apps and data connections to partners. The Optus breach is alleged to have started with one of these.',
    options: { unknown: { label: 'Not fully' }, inventoried: { label: 'Yes, but they are not regularly tested' }, tested: { label: 'Yes, and they are tested regularly' } },
  },
  inventory: {
    label: 'Do you have a complete, current list of your network equipment and systems?',
    helper: 'Including what suppliers manage for you.',
    options: { partial: { label: 'Partly' }, mostly: { label: 'Mostly' }, complete: { label: 'Yes, kept current' } },
  },
  logging: {
    label: 'If someone were inside your network today, how soon would you know?',
    helper: 'Who is watching for unusual activity.',
    options: { limited: { label: 'Probably not until something broke' }, central: { label: 'Within days, if someone checked' }, monitored: { label: 'Within hours, it is watched around the clock' } },
  },
  irPlan: {
    label: 'If the network were attacked tonight, does everyone know who decides and who reports?',
    helper: 'A written cyber incident response plan.',
    options: { none: { label: 'No written plan' }, it_only: { label: 'There is a plan, but it is for IT and not recently tested' }, tested: { label: 'Yes, and we practised it this year' } },
  },
  changeProcess: {
    label: 'Before a big change, like a new supplier or outsourcing, does anyone check whether government must be told?',
    helper: 'SOCI requires notice of some changes in advance.',
    options: { none: { label: 'No' }, informal: { label: 'Sometimes' }, formal: { label: 'Yes, it is part of approval' } },
  },
}

/** Plain names for the plan steps. */
export const plainFix: Record<FixId, string> = {
  fix_inventory: 'Know exactly what we run',
  fix_change: 'Check every big change against SOCI',
  fix_privileged: 'Sign-in that cannot be phished, for everyone with powerful access',
  fix_ir: 'A practised plan for a cyber incident',
  fix_vendor: 'Supplier access only when approved, and recorded',
  fix_edge: 'Keep internet-facing equipment up to date',
  fix_api: 'Find and test every online service that holds customer data',
  fix_monitor: 'Someone watching around the clock',
  fix_mgmt_sep: 'Separate the systems that run the network from office IT',
  fix_segment: 'Limit what any one account can reach',
  fix_li: 'Wall off interception systems',
  fix_site: 'Separate power and cooling from the office network',
}

/** One plain sentence per risky answer, for the executive and board briefings. */
export const plainIssue: Partial<Record<keyof Inputs, Partial<Record<string, string>>>> = {
  mgmtSeparation: { shared: 'A single tricked staff member could lead to the network itself.', firewalled: 'The barrier between office IT and the network can be crossed with an admin login.' },
  mgmtSegmentation: { flat: 'One misused admin account could reach the whole network.' },
  privilegedAuth: { password: 'A stolen password is likely enough to get powerful access.', mfa_app: 'Phone codes help, but people can still be tricked into approving them.' },
  vendorAccess: { always_on: 'Suppliers can log in at any time, so a stolen supplier login is a standing way in.' },
  edgePatching: { behind: 'Internet-facing equipment is behind on updates, the way most recent telco attacks started.' },
  apiExposure: { unknown: 'Not every online service holding customer data is known, so it cannot be tested.' },
  logging: { limited: 'An attacker could be inside for weeks before anyone notices.', central: 'An attack may run for days before it is noticed.' },
  irPlan: { none: 'There is no written plan for who decides and who reports in an incident.', it_only: 'The incident plan has not been practised for a network attack.' },
  changeProcess: { none: 'Changes that must be notified to government could be missed.' },
  siteOt: { on_corporate: 'Power and cooling at exchanges could be switched off through an office IT attack.' },
  liIsolation: { shared: 'Interception systems could be reached by anyone who gets into network management.' },
}

export const briefing = {
  engineer: { title: 'Your technical view', sub: 'Attack paths, zones and the controls that stop them. Open any area for detail.' },
  security: { title: 'Your security view', sub: 'Where an attacker is likely to get in, how far they could go, and whether you would notice.' },
  compliance: { title: 'In short, for your SOCI reporting', sub: 'What this result is likely to mean for your obligations and annual report.' },
  executive: { title: 'What this could mean for the business', sub: 'In plain terms: what is at risk, what it could cost, and what to fund first.' },
  board: { title: 'What the board needs to know', sub: 'One page. The headline, your obligations, and the questions to ask management.' },
  headline: {
    'Highly exposed': 'An attack is likely to spread from where it gets in to the systems that run the network.',
    'Partly exposed': 'An attack could likely reach important parts of the network, but not all of it.',
    Contained: 'An attack is likely to stay close to where it gets in.',
  } as Record<string, string>,
  impacts: {
    services: 'Customer services could go down, including Triple Zero calls.',
    customer: 'Customer personal information could be taken.',
    li: 'Interception systems could be reached, a serious national security matter.',
    site: 'Power and cooling at exchanges and data centres could be switched off.',
  },
  topIssues: 'The main reasons',
  decisions: 'The first three decisions to make',
  technical: 'Show the technical detail',
  toObligations: (ready: number, of: number) => `${ready} of ${of} SOCI obligations we can assess look likely ready.`,
  deadlines:
    'Framework maturity level 1 was due by 4 October 2026. Level 2 for critical carrier assets is due by 4 October 2027. The first telco risk management program annual report applies in 2026.',
}

export const board = {
  accountability:
    'The annual report for a SOCI risk management program is generally approved by the board or governing body, so directors are likely to be asked how they satisfied themselves it is accurate. Confirm the exact requirement for your assets with your advisers.',
  askTitle: 'Questions to ask management',
  ask: [
    'Which of our SOCI obligations are we not yet meeting, and by when will we?',
    'Have we met framework maturity level 1, and what is the plan for level 2 by October 2027?',
    'If our network were attacked tonight, who decides, who reports within 12 hours, and when did we last practise it?',
    'Which suppliers can log in to our network, and how do we control and record that access?',
    'What would a day-long outage cost us, and is that within our risk appetite?',
  ],
}

export const cost = {
  title: 'What a disruption could cost',
  sub: 'Use your own numbers. Nothing here is sent anywhere.',
  revenue: 'Annual revenue (A$ millions)',
  hours: 'Hours of disruption to plan for',
  hoursHint: 'Your planning assumption. Recovery from a destructive attack can take days or weeks.',
  result: (dollars: string, hours: number) => `About ${dollars} of revenue at risk for ${hours} hour${hours === 1 ? '' : 's'} of full disruption.`,
  empty: 'Enter your annual revenue to see revenue at risk.',
  beyond: 'Revenue is usually the smaller part. Response, recovery, customer support, credits, legal costs and penalties often cost more.',
  refsTitle: 'Published reference points',
  refs: [
    { text: 'Singtel set aside about A$140 million for costs of the 2022 Optus data breach, before any penalties.', label: 'iTWire', url: 'https://itwire.com/it-industry-news/telecoms-and-nbn/optus-sets-aside-$140m-for-costs-associated-with-data-breach' },
    { text: 'Privacy Act penalties for serious interference can reach the greater of $50 million, three times the benefit obtained, or 30% of turnover for the period.', label: 'Allens, November 2022', url: 'https://www.allens.com.au/insights-news/insights/2022/11/Privacy-Act-changes-raise-the-bar/' },
  ],
}

/** Exercise discussion questions by role (technical roles also get the attack-specific ones). */
export const exerciseQuestions: Record<Role, string[]> = {
  engineer: [
    'Who has the authority to isolate network equipment, even if it affects customers?',
    'Which vendors would you need to call, and do you have their out-of-hours contacts?',
  ],
  security: [
    'Who makes the call on whether the 12-hour or 72-hour reporting clock has started?',
    'Which logs would you need first, and how long do you keep them?',
  ],
  compliance: [
    'Who decides whether this is reportable within 12 hours or 72 hours, and how is that recorded?',
    'What evidence of this exercise would you keep for your annual report?',
    'Which other regulators would need to hear, such as the Information Commissioner if customer data is involved?',
  ],
  executive: [
    'Who would you put in charge, and who speaks to customers and media?',
    'Which services would you restore first, and what would you tell customers in the first hour?',
    'What would a day of this cost, and is there insurance that covers it?',
  ],
  board: [
    'Would the board hear about this within hours, and from whom?',
    'Has management practised this, and what did they learn?',
    'Is this risk within the appetite the board has set?',
  ],
}
