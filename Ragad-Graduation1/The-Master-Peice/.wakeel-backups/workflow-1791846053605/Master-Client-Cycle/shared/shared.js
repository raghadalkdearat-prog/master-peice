
document.addEventListener("DOMContentLoaded", async () => {

  async function loadComponent(elementId, filePath) {

    const element = document.getElementById(elementId);

    if (!element) return;

    try {
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error("Failed to load: " + filePath);
      }

      element.innerHTML = await response.text();

    } catch (error) {
      console.error(error);
    }
  }

  await Promise.all([
    loadComponent("shared-navbar", "../shared/nav.html"),
    loadComponent("shared-footer", "../shared/footer.html")
  ]);

});
