import { useState } from 'react';
import { products } from '../data/products.js';
import { whatsappLink } from '../data/site.js';

const initial = { name: '', phone: '', product: '', message: '' };

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name.';
  const digits = v.phone.replace(/[\s-]/g, '').replace(/^(\+91|91|0)/, '');
  if (!/^[6-9]\d{9}$/.test(digits)) e.phone = 'Enter a valid 10-digit mobile number.';
  if (!v.product) e.product = 'Please choose a product.';
  if (v.message.trim().length < 5) e.message = 'Please add a short message.';
  return e;
}

// No backend is connected. A valid form opens WhatsApp with the details prefilled;
// the inquiry is only sent when the customer presses Send in WhatsApp.
export default function ContactForm() {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [opened, setOpened] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setOpened(false);
    if (Object.keys(found).length) return;

    const text =
      `Hello SHIVA STEEL, I would like to make an inquiry.\n` +
      `Name: ${values.name.trim()}\n` +
      `Phone: ${values.phone.trim()}\n` +
      `Product: ${values.product}\n` +
      `Message: ${values.message.trim()}`;
    window.open(whatsappLink(text), '_blank', 'noopener,noreferrer');
    setOpened(true);
  };

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <h3 className="form__title">Send an Inquiry</h3>

      <div className="field">
        <label htmlFor="cf-name">Customer Name</label>
        <input id="cf-name" name="name" type="text" autoComplete="name" value={values.name} onChange={onChange} aria-invalid={!!errors.name} />
        {errors.name && <span className="field__error" role="alert">{errors.name}</span>}
      </div>

      <div className="field">
        <label htmlFor="cf-phone">Phone Number</label>
        <input id="cf-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. 98XXXXXXXX" value={values.phone} onChange={onChange} aria-invalid={!!errors.phone} />
        {errors.phone && <span className="field__error" role="alert">{errors.phone}</span>}
      </div>

      <div className="field">
        <label htmlFor="cf-product">Product Interested In</label>
        <select id="cf-product" name="product" value={values.product} onChange={onChange} aria-invalid={!!errors.product}>
          <option value="">Select a product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.title}>{p.title}</option>
          ))}
        </select>
        {errors.product && <span className="field__error" role="alert">{errors.product}</span>}
      </div>

      <div className="field">
        <label htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="message" rows="4" value={values.message} onChange={onChange} aria-invalid={!!errors.message} />
        {errors.message && <span className="field__error" role="alert">{errors.message}</span>}
      </div>

      <button type="submit" className="btn btn--gold btn--block">Continue on WhatsApp</button>
      <p className="form__hint">
        This opens WhatsApp with your details filled in. Your inquiry is sent only when you press
        Send there.
      </p>
      {opened && (
        <p className="form__status" role="status">
          WhatsApp should now be open. If it did not open, please call us on 9855759696.
        </p>
      )}
    </form>
  );
}
