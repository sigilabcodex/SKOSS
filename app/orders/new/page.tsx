import { products } from '@/data/demo-fixtures';

export default function NewOrderPage() {
  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="eyebrow">Sales workspace</p>
          <h1>New order placeholder</h1>
          <p>
            This scaffold keeps draft capture central: operators can use structured products where
            available and freeform labels where they are not.
          </p>
        </div>
      </section>

      <section className="panel form-preview">
        <div>
          <label>Draft customer name</label>
          <input value="Sofía birthday" readOnly />
        </div>
        <div>
          <label>Production date</label>
          <input value="2026-03-28" readOnly />
        </div>
        <div>
          <label>Suggested structured variants</label>
          <ul>
            {products.flatMap((product) =>
              product.variants.map((variant) => (
                <li key={variant.id}>
                  {product.name} / {variant.name}
                </li>
              )),
            )}
          </ul>
        </div>
        <div>
          <label>Draft product support</label>
          <textarea value="mini sweet tray — qty 2 — confirm decoration at pickup" readOnly />
        </div>
      </section>
    </div>
  );
}
