const SITE = {
  pricePerNight: 5000,
  phone1: "+79772674550",
  phone2: "+79686073393"
};

const heroPrice = document.getElementById("heroPrice");
if (heroPrice) {
  heroPrice.textContent = SITE.pricePerNight.toLocaleString("ru-RU");
}
