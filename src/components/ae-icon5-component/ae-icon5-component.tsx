/*
@Component({
  tag: 'my-name',
  styleUrl: 'my-name.css'
})
export class MyName {



  render() {
    return (
      <form onSubmit={(e) => this.handleSubmit(e)}>
        <label>
          Name:
          <input type="text" value={this.value} onInput={(event) => this.handleChange(event)} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
*/

// eslint-disable-next-line no-unused-vars
import { Component, Element, h, Prop, State } from '@stencil/core'
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
  public aeicons: string[] = [];
  @Element() el: HTMLElement;

  @Prop() adaept: string;
  @Prop() aesize: string;
  @Prop() aetype: string
  @Prop() arialabel: string;
  @Prop({ mutable: true }) color: string;
  @Prop({ mutable: true }) name: string;
  @Prop({ mutable: true }) src: string;

  @State() aevalue: string; // result from form submit

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
    this.aeicons = [
      'assets/aeicons/ae-outline.svg', //'one',
      'assets/aeicons/ae-red-green.svg', //'two',
      'assets/aeicons/ae-yellow.svg', //'three',
      'assets/aeicons/ae-red.svg', //'four',
      'assets/aeicons/ae-green.svg', //'five',
      'assets/aeicons/ae-blue.svg' //'six',
      //'seven',
      //'eight',
      //'nine',
      //'ten',
      //'eleven',
      //'twelve'
    ]
  }

  handleSubmit(e) {
    e.preventDefault()
    console.log('handleSubmit: ' + this.aevalue)
    // send data to the backend
    this.getNamigram()
  }

  handleChange(event) {
    this.aevalue = event.target.value
  }

  getNamigram() {
    console.log('getNamigram: ' + this.aevalue)

    /*
    console.log('namigram test')
    console.log(this.src)

    const iconarray = (
      [
        { 1: 'one' },
        { 2: 'two' },
        { 3: 'three' },
        { 4: 'four' },
        { 5: 'five' },
        { 6: 'six' },
        { 7: 'seven' },
        { 8: 'eight' },
        { 9: 'nine' },
        { 10: 'ten' },
        { 11: 'eleven' },
        { 12: 'twelve' }
      ])

    console.log(iconarray[0])
    console.log(iconarray[1])
    console.log(iconarray[2])
    console.log(iconarray[3])
    console.log(iconarray[4])
    console.log(iconarray[5])
    console.log(iconarray[6])
    console.log(iconarray[7])
    console.log(iconarray[8])
    console.log(iconarray[9])
    console.log(iconarray[10])
    console.log(iconarray[11])
    console.log(iconarray[12])
    */
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

  /* Render Label Test example
  [
    <div>
      <ion-content>
        <ion-list>
          <ion-label>Label Test</ion-label>
  { / * {this.aeicons.map((aeicon, index) => ( * / }
            <ion-item>
              <ion-label>{index}</ion-label>
              <ion-icon class={this.aesize} src={this.src} color={this.color} onClick={this.iconClicked}>
              </ion-icon>
            </ion-item>
          ))}

          </ion-list>
          </ion-content>
        </div>
      ]
*/

  // Ref: https://fettblog.eu/boolean-in-javascript-and-typescript/
  render() {
    if (Boolean(this.src) && Boolean(this.adaept === 'icons')) {
      return [
        <div>
          <ion-content>
            <ion-list>
              {this.aeicons.map((aeicon, index) => (
                <ion-item style={{ '--animation-timimg': index } as any} >
                  {/* <ion-label>{index}</ion-label> */}
                  <ion-icon class={this.aesize} src={aeicon} color={this.color} onClick={this.iconClicked}>
                  </ion-icon>
                </ion-item>
              ))}
            </ion-list>
          </ion-content>
        </div>
      ]
    } else if (Boolean(this.src) && Boolean(this.adaept === 'mydata')) {
      return (
        <form onSubmit={(e) => this.handleSubmit(e)}>
          <label>
            Name:&nbsp;
            <input type="text" value={this.aevalue} onInput={(event) => this.handleChange(event)} />
          </label>
          <input type="submit" value="Submit" />
        </form>
      )
    } else if (Boolean(this.src) && Boolean(this.adaept === 'adaept')) {
      return (<ion-icon class={this.aesize} src={this.src} color={this.color} onClick={this.iconClicked}></ion-icon>)
    } else if (this.name) {
      return (<ion-icon class={this.aesize} name={this.name} color={this.color} onClick={this.iconClicked}></ion-icon>)
    } else {
      return (null)
    }
  }
}
