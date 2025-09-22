export default async function BusinessSlugPage(
  props: PageProps<"/businesses/[businessSlug]">
) {
  const { businessSlug } = await props.params;
  return <div>Business {businessSlug}</div>;
}
