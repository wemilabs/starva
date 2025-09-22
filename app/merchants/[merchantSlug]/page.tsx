export default async function singleMerchantPage(
  props: PageProps<"/merchants/[merchantSlug]">
) {
  const { merchantSlug } = await props.params;
  return <div>{merchantSlug}'s Full Catalogue Menu</div>;
}
