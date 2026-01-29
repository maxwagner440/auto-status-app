export const CANONICAL_STATES = [
  { key: "CHECKED_IN", label: "Vehicle checked in", customerBlurb: "We have your vehicle and it is queued for service." },
  { key: "DIAGNOSIS", label: "Diagnosis in progress", customerBlurb: "We are diagnosing the issue(s) and confirming what work is needed." },
  { key: "AWAITING_APPROVAL", label: "Awaiting estimate approval", customerBlurb: "Diagnosis is complete and we need your approval before repairs continue." },
  { key: "PARTS_ORDERED", label: "Parts ordered", customerBlurb: "Required parts have been ordered and we are waiting for delivery." },
  { key: "REPAIR", label: "Repair in progress", customerBlurb: "Approved repairs are currently underway." },
  { key: "QC", label: "Quality check", customerBlurb: "We’re verifying the work and performing final checks." },
  { key: "READY", label: "Ready for pickup", customerBlurb: "Your vehicle is ready for pickup." }
] as const;

export const FLAGS = [
  { key: "NONE", label: "None", customerBlurb: "" },
  { key: "WAITING_ON_CUSTOMER", label: "Waiting on customer response", customerBlurb: "We are waiting for your response to continue." },
  { key: "CALL_US", label: "Customer contact required", customerBlurb: "Please call us to discuss findings or approve next steps." },
  { key: "WAITING_ON_PARTS", label: "Waiting on parts delivery", customerBlurb: "We are waiting on parts delivery to proceed." },
  { key: "THIRD_PARTY", label: "Waiting on third-party", customerBlurb: "We are waiting on a third-party step (e.g., warranty/insurer/inspection)." }
] as const;
