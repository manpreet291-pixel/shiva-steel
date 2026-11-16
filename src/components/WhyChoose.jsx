import useReveal from '../hooks/useReveal.js';

const points = [
  { title: 'Customised Designs', text: 'Gates and railings planned around your space, taste and measurements.', icon: 'M4 20l4-1 11-11-3-3L5 16l-1 4Zm13-15 2-2 3 3-2 2' },
  { title: 'Quality Craftsmanship', text: 'Careful fabrication and finishing in every piece we make.', icon: 'M12 3l2.600 5.300 5.800.8-4.200 4.100 1 5.800L12 16.300 6.800 19l1-5.800L3.600 9.100l5.800-.8L12 3Z' },
  { title: 'Modern Steel Designs', text: 'Contemporary styles, including CNC-cut patterns and clean profiles.', icon: 'M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z' },
  { title: 'Attention to Detail', text: 'From weld lines to the final finish, the small things get our focus.', icon: 'M10 4a6 6 0 1 0 3.500 10.900l5.300 5.300 1.400-1.400-5.300-5.300A6 6 0 0 0 10 4Z' },
  { title: 'Customer-Focused Service', text: 'We listen to what you need and stay in touch by call or WhatsApp.', icon: 'M12 21s-7-4.400-9.300-9A5.300 5.300 0 0 1 12 6.300 5.300 5.300 0 0 1 21.300 12C19 16.600 12 21 12 21Z' },
];

export default function WhyChoose() {
  const ref = useReveal();
  return (
    <section className="section section--dark" aria-labelledby="why-title">
      <div className="container">
        <div className="section__head reveal" ref={ref}>
          <p className="eyebrow">Why Choose SHIVA STEEL?</p>
          <h2 className="section__title section__title--light" id="why-title">
            Built on craft, designed for you
          </h2>
        </div>
        <div className="why">
          {points.map((p) => (
            <div className="why__item" key={p.title}>
              <span className="why__icon">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={p.icon} />
                </svg>
              </span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
