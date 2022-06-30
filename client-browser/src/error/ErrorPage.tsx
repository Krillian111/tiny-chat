export function ErrorPage(props: { errors: ReadonlyArray<string> }) {
  if (!props.errors.length) {
    return <></>;
  }
  return (
    <div className="container text-danger">
      <h5>Error</h5>
      {props.errors.map((error, index) => (
        <div key={index}>{error}</div>
      ))}
    </div>
  );
}
