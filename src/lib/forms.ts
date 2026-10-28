// Website form submissions go to the shared ash-be form endpoint, which emails them to OTCD.
const FORM_API = 'https://ash-be-z3x4.onrender.com/api/tickets/send-form-submission'
export const REVIEW_TO = 'admin@otcyberdefence.com.au'

export async function postForm(f: { formName: string; subject: string; name: string; email: string; message: string; location?: string }) {
  const r = await fetch(FORM_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      formData: {
        websiteName: 'OT Cyber Defence',
        formName: f.formName,
        customerName: f.name,
        customerEmail: f.email,
        subject: f.subject,
        message: f.message,
        phone: '',
        location: f.location ?? '',
      },
      options: { to: REVIEW_TO, websiteName: 'OT Cyber Defence' },
    }),
  })
  if (!(r.status === 201 || r.ok)) throw new Error(String(r.status))
}
