const StackOperationParams = ({
  tables = ["customers", "orders", "products", "invoices", "shipments"],
}) => {
  return (
    <div>
      <h2>Stack Operation Parameters</h2>
      <p>
        This component shows the list of table names that will be used by the
        Stack operation. You can pass a `tables` prop (array of strings) to
        override the default example list.
      </p>

      <section aria-label="table-names">
        <h3>Tables</h3>
        {tables && tables.length ? (
          <ul>
            {tables.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : (
          <p>
            <em>No tables provided.</em>
          </p>
        )}
      </section>
    </div>
  );
};

export default StackOperationParams;
