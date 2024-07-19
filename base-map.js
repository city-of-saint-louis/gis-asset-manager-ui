class GISAssetChooserComponent extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor for a custom web component
  }

  connectedCallback() {
    console.log("gis-asset-chooser initialized");
    try {
      const title = this.getAttribute("title") || "";
      const hint = this.getAttribute("hint") || "";
      // keep line below for future reference
      // const allowPoints = this.getAttribute("allowPoints") || false;
      this.innerHTML = `
      <section>
       <p>
         <strong>${title}</strong>
       </p>
       <p>
         ${hint}
       </p>
       <p id="validity-message"></p>
       <div class="row">
	       <div class="col-md-7">
           <div id="viewDiv" style="width: 100%; height: 500px;">
         </div>
       </div>
        <div class="col-md-5 stat-container">
          <div id="layer-data-div" class="stat-group  ">
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
  customElements.define("gis-asset-chooser", GISAssetChooserComponent);
});