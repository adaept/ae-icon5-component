// eslint-disable-next-line no-unused-vars
import { Component, h, Element, Prop } from '@stencil/core'
import 'ionicons'

/*
import { createAnimation } from "@ionic/core";

const animation = createAnimation()
  .addElement(document.querySelector(".img"))
  .easing("ease-in-out")
  .duration(1000)
  .direction("alternate")
  .iterations(2)
  .keyframes([
    { offset: 0, transform: "scale(.5)", opacity: "1" },
    { offset: 1, transform: "scale(.75)", opacity: "0.5" }
  ]);

animation.play();
*/

const maxsize: number = 128
const initsize: number = 48
// let prevsizeplus: number = 8;
// let prevsizeminus: number = 8;
let currsizeplus: number = 8
let currsizeminus: number = 8

@Component({
  tag: 'ae-icon5-component',
  styleUrl: 'ae-icon5-component.css',
  shadow: true
})
export class AeIcon5Component {
  @Element() el: HTMLElement;

  @Prop() adaept: boolean;
  @Prop() aesize: string;
  @Prop() aetype: string
  @Prop() arialabel: string;
  @Prop({ mutable: true }) color: string;
  @Prop({ mutable: true }) name: string;
  @Prop({ mutable: true }) src: string;

  constructor() {
    this.iconClicked = this.iconClicked.bind(this)
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
    console.log('resetMinusPlusSize')
  }

  getMyComputedStyle(cssVarName: string, propValue: string) {
    if (propValue) {
      document.documentElement.style.setProperty(cssVarName, propValue)
      console.log('A. getMyComputedStyle ' + cssVarName + ' = ' + propValue)
    }
    console.log('B. getMyComputedStyle DONE')
    return getComputedStyle(document.documentElement).getPropertyValue(cssVarName)
  }

  getElementStyleProps(myElement: string) {
    // Ref: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
    const element = document.getElementById(myElement)
    let out = ''
    const elementStyle = element.style
    const computedStyle = window.getComputedStyle(element, null)

    for (const prop in elementStyle) {
      // eslint-disable-next-line no-prototype-builtins
      if (elementStyle.hasOwnProperty(prop)) {
        out += '  ' + prop + " = '" + elementStyle[prop] + "' > '" + computedStyle[prop] + "'\n"
      }
    }
    console.log(out)
  }

  getIconSizeMinus() {
    //console.log('getIconSizeMinus prevsizeminus = ' + prevsizeminus);
    //console.log('getIconSizeMinus this.aesize = ' + this.aesize + ' ' + this.aesize.substr(2));
    currsizeminus = +this.aesize.substr(2) - 8
    // eslint-disable-next-line no-unused-expressions
    currsizeminus < 8 ? currsizeminus = initsize : currsizeminus
    //console.log(currsizeminus);
  }

  getIconSizePlus() {
    //console.log('getIconSizePlus prevsizeplus = ' + prevsizeplus);
    //console.log('getIconSizePlus this.aesize = ' + this.aesize + ' ' + this.aesize.substr(2));
    currsizeplus = +this.aesize.substr(2) + 8
    // eslint-disable-next-line no-unused-expressions
    currsizeplus > maxsize ? currsizeplus = 8 : currsizeplus
    //console.log(currsizeplus);
  }

  iconClicked(evt) {
    console.log('iconClicked evt = ' + evt.currentTarget)
    console.log('iconClicked this.arialabel = ' + this.arialabel)
    // Only output icon info for the component website
    if (document.getElementById('containerPara')) {
      if (this.arialabel) {
        switch (this.arialabel) {
          case 'ae-remove-circle': {
            this.getIconSizeMinus()
            this.aesize = 'ae' + currsizeminus
            //console.log('ae-remove-circle: ' + this.arialabel + ' ' + this.aesize + ' ' + this.aetype);
            document.getElementById('containerDetail').innerHTML = '<b>name:</b>' + this.name +
              ' <b>color:</b>' + this.color + ' <b>aesize:</b>' + this.aesize + ' <b>aetype:</b>' + this.aetype +
              ' <b>arialabel:</b>' + this.arialabel

            document.getElementById('containerPara').innerHTML =
              '<ae-icon5-component aesize="ae32" ' +
              ' name=' + this.name +
              ' color=' + this.color +
              ' arialabel=' + this.arialabel + '>'
            break
          }
          case 'ae-add-circle': {
            this.getIconSizePlus()
            this.aesize = 'ae' + currsizeplus
            //console.log('ae-add-circle: ' + this.arialabel + ' ' + this.aesize + ' ' + this.aetype);
            document.getElementById('containerDetail').innerHTML = '<b>name:</b>' + this.name +
              ' <b>color:</b>' + this.color + ' <b>aesize:</b>' + this.aesize + ' <b>aetype:</b>' + this.aetype +
              ' <b>arialabel:</b>' + this.arialabel

            document.getElementById('containerPara').innerHTML =
              '<ae-icon5-component aesize="ae32" ' +
              ' name=' + this.name +
              ' color=' + this.color +
              ' arialabel=' + this.arialabel + '>'
            break
          }
          case 'ae-refresh-circle': {
            /*
            FIXME
            */
            break
          }
          default: {
            //statements;
            break
          }
        }
      } else {
        if (document.getElementById('containerDetail')) {
          document.getElementById('containerDetail').innerHTML =
            '<b>name:</b>' + this.name +
            ' <b>color:</b>' + this.color + ' <b>aesize:</b>' + this.aesize + ' <b>aetype:</b>' + this.aetype +
            ' <b>arialabel:</b>' + this.arialabel
          //console.log('Z ' + document.getElementById("containerDetail").innerHTML);

          document.getElementById('containerPara').innerHTML =
            '<ae-icon5-component aesize="ae32" ' +
            ' name=' + this.name +
            ' color=' + this.color +
            ' arialabel=' + this.arialabel + '>'
        }
      }
    }
  }

  // Ref: https://fettblog.eu/boolean-in-javascript-and-typescript/

  render() {
    if (Boolean(this.src) && this.adaept) {
      return (<ion-icon class={this.aesize} src={this.src} color={this.color} onClick={this.iconClicked}></ion-icon>)
    } else {
      // return (<ion-icon class={this.aesize} name={this.name} color={this.color} onClick={this.iconClicked}></ion-icon>)
      return (null)
    }
  }
}
