class AssetChooserContainerComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor for a custom web component
  }

  connectedCallback() {
    console.log("asset-chooser-container initialized");
    try {
      const title = this.getAttribute("title") || "";
      const hint = this.getAttribute("hint") || "";
      this.innerHTML = `
      <section class="stat-container">
        <p>
          <strong>${title}</strong>
        </p>
        <p>
         ${hint}
       </p>
       <p 
         id="validity-message"
         aria-live="polite" aria-atomic="true"
       >
       </p>
       <div class="row">
	       <div class="col-md-7">
           <div id="viewDiv" style="width: 100%; height: 500px;">
         </div>
       </div>
        <div class="col-md-5">
          <div id="layer-data-div" class="stat-group ">
          </div>
        </div>
        </div>
      </section>
    `;
    } catch (e) {
      console.error(e);
      document.getElementById(
        "viewDiv"
      ).innerHTML = `<p>There was a problem loading the map. Please try again later.</p>`;
    }
  }
}

// define the custom component after the page has loaded
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("asset-chooser-container", AssetChooserContainerComponent);
});