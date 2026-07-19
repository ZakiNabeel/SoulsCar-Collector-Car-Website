// Floating WhatsApp bubble shown in the bottom-right corner of every page.
// Links to the business WhatsApp chat. The number comes from
// NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, international format, e.g.
// 923370108888); the button hides itself until a number is configured.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export function WhatsAppFloat() {
  if (!WHATSAPP_NUMBER) return null;

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      {/* Official WhatsApp glyph */}
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-8 w-8" aria-hidden="true">
        <path d="M16.004 4.003c-6.628 0-12 5.372-12 12 0 2.118.553 4.185 1.604 6.008L4.01 27.996l6.135-1.56a11.94 11.94 0 0 0 5.859 1.567h.005c6.627 0 11.999-5.373 11.999-12s-5.372-12-12.004-12zm0 21.973h-.004a9.95 9.95 0 0 1-5.075-1.39l-.364-.216-3.64.926.972-3.55-.237-.365a9.94 9.94 0 0 1-1.652-5.378c0-5.514 4.486-10 10.004-10 5.514 0 10 4.486 10 10s-4.486 9.973-10.004 9.973zm5.487-7.468c-.301-.15-1.78-.878-2.056-.979-.276-.1-.477-.15-.678.151-.2.3-.777.978-.953 1.179-.176.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.492-.894-.798-1.498-1.783-1.674-2.084-.175-.301-.019-.463.132-.613.135-.135.301-.351.452-.527.15-.176.2-.301.301-.502.1-.2.05-.376-.025-.527-.075-.15-.678-1.633-.928-2.235-.245-.587-.494-.508-.678-.517l-.578-.01c-.2 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.512s1.079 2.914 1.229 3.115c.15.2 2.123 3.24 5.143 4.545.719.31 1.28.495 1.717.634.722.229 1.379.197 1.898.12.579-.087 1.78-.728 2.031-1.431.251-.703.251-1.305.176-1.431-.075-.125-.276-.2-.577-.351z" />
      </svg>
    </a>
  );
}
