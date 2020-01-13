import { Component, h, Element, Prop } from "@stencil/core";
import "ionicons";

let maxsize: number = 128;
let initsize: number = 40;
//let prevsizeplus: number = 8;
//let prevsizeminus: number = 8;
let currsizeplus: number = 8;
let currsizeminus: number = 8;

@Component({
  tag: "ae-icon5-component",
  styleUrl: "ae-icon5-component.css",
  shadow: true
})
export class AeIcon5Component {

  @Element() el: HTMLElement;

  @Prop() aetype: string
  @Prop() aesize: string;
  @Prop() name: string;
  @Prop() color: string;
  @Prop() arialabel: string;

  constructor() {
    this.iconClicked = this.iconClicked.bind(this);
  }

  /**
   * The component is about to load and has not rendered yet.
   * This is the best place to make any data updates
   * before the first render.
   * componentWillLoad will only be called once.
   */
  componentWillLoad() {
    //console.log('Component ae-icon5-component is about to be rendered');
    //console.log('aesize=' + this.aesize + ' name=' + this.name + ' color=' + this.color)
    //console.log(this.el.shadowRoot);
    //console.log('aetype=' + this.aetype);
  }

  resetMinusPlusSize() {
    console.log('resetMinusPlusSize');
  }

  getMyComputedStyle(cssVarName: string, propValue: string) {
    if (propValue) {
      document.documentElement.style.setProperty(cssVarName, propValue)
      console.log('A. getMyComputedStyle ' + cssVarName + ' = ' + propValue)
    }
    console.log('B. getMyComputedStyle DONE');
    return getComputedStyle(document.documentElement).getPropertyValue(cssVarName);
  }

  getElementStyleProps(myElement: string) {
    // Ref: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
    let element = document.getElementById(myElement);
    let out = "";
    let elementStyle = element.style;
    let computedStyle = window.getComputedStyle(element, null);

    for (const prop in elementStyle) {
      if (elementStyle.hasOwnProperty(prop)) {
        out += "  " + prop + " = '" + elementStyle[prop] + "' > '" + computedStyle[prop] + "'\n";
      }
    }
    console.log(out)
  }

  getIconSizeMinus() {
    //console.log('getIconSizeMinus prevsizeminus = ' + prevsizeminus);
    //console.log('getIconSizeMinus this.aesize = ' + this.aesize + ' ' + this.aesize.substr(2));
    currsizeminus = +this.aesize.substr(2) - 8;
    currsizeminus < 8 ? currsizeminus = initsize : currsizeminus;
    //console.log(currsizeminus);
  }

  getIconSizePlus() {
    //console.log('getIconSizePlus prevsizeplus = ' + prevsizeplus);
    //console.log('getIconSizePlus this.aesize = ' + this.aesize + ' ' + this.aesize.substr(2));
    currsizeplus = +this.aesize.substr(2) + 8;
    currsizeplus > maxsize ? currsizeplus = 8 : currsizeplus;
    //console.log(currsizeplus);
  }

  iconClicked(evt) {
    console.log('iconClicked evt = ' + evt.currentTarget);
    console.log('iconClicked this.arialabel = ' + this.arialabel);
    if (this.arialabel) {
      switch (this.arialabel) {
        case "ae-remove-circle": {
          this.getIconSizeMinus();
          this.aesize = "ae" + currsizeminus
          //console.log('ae-remove-circle: ' + this.arialabel + ' ' + this.aesize + ' ' + this.aetype);
          document.getElementById("containerPara").innerHTML = "<br>" + "name:" + this.name +
            " color:" + this.color + " aesize:" + this.aesize + " aetype:" + this.aetype +
            " arialabel:" + this.arialabel
          break;
        }
        case "ae-add-circle": {
          this.getIconSizePlus();
          this.aesize = "ae" + currsizeplus
          //console.log('ae-add-circle: ' + this.arialabel + ' ' + this.aesize + ' ' + this.aetype);
          document.getElementById("containerPara").innerHTML = "<br>" + "name:" + this.name +
            " color:" + this.color + " aesize:" + this.aesize + " aetype:" + this.aetype +
            " arialabel:" + this.arialabel
          break;
        }
        case "ae-refresh-circle": {
          /*
          this.aesize = "ae" + initsize;

          // list all element style properties
          //  this.getElementStyleProps("3");
          //  console.log('My Computed Style = ' + this.getMyComputedStyle('--color', 'orange'));
          //

          console.log('ae-refresh-circle: ' + this.arialabel + ' ' + this.aesize + ' ' + this.aetype);
          */
          break;
        }
        default: {
          //statements;
          break;
        }
      }
    } else {
      document.getElementById("containerPara").innerHTML = "<br>" + "name:" + this.name +
        " color:" + this.color + " aesize:" + this.aesize + " aetype:" + this.aetype +
        " arialabel:" + this.arialabel
    }
  }

  render() {
    return (
      <ion-icon class={this.aesize} name={this.name} color={this.color} onClick={this.iconClicked}></ion-icon>
    );
  }
}

