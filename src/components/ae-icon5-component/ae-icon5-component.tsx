// eslint-disable-next-line @typescript-eslint/no-unused-vars -- `h` is the JSX pragma, used by compiled render output
import { Component, Element, h, Method, Prop, State, Watch } from '@stencil/core'
import 'ionicons' // defines the <ion-icon> element
import { registerDefaultIcons } from '../../icons' // scoped-icon manifest (D2)

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
export class AeIcon5 {
  /**
   * ae logo icons
   */
  public aelogos: string[] = [];

  /**
   * namigram icons
   */
  public namigrams: string[] = [];

  @Element() el: HTMLElement;

  /**
   * Identifier for render options
   */
  @Prop() adaept: string;

  /**
   * Icon source set (D3 seam). Only 'ionicons' is implemented this cycle;
   * additional providers (e.g. 'iconify:*') can be added without API churn.
   */
  @Prop() set: string = 'ionicons';

  /**
   * Size of the icon
   */
  @Prop() aesize: string;

  /**
   * Hover-effect preset: `round` (default ring shape, unchanged), `square`, `pentagon`,
   * or `rotate` (rotates by `aerotatedeg` on hover — see the header ae logo demo). `pulse`
   * is a planned fifth preset, not yet implemented (modernization plan §4.1).
   */
  @Prop() aetype: string

  /**
   * Rotation angle in degrees applied via `--ae-hover-rotate-deg`, used by
   * `aetype="rotate"`'s hover effect. Ignored for every other `aetype`.
   */
  @Prop() aerotatedeg: number = 180

  @Watch('aerotatedeg')
  applyRotateDeg() {
    this.el.style.setProperty('--ae-hover-rotate-deg', `${this.aerotatedeg}deg`)
  }

  /**
   * Accessible label for the icon, applied to the inner `<ion-icon>`'s
   * `aria-label`. Falls back to `name` when not set (see `resolvedArialabel`)
   * so consumers never have to pass it just to avoid an empty/undefined
   * accessible name — set it explicitly to override.
   */
  @Prop() arialabel: string;

  /**
   * `arialabel` if the consumer set one, else `name` — never `undefined`.
   * Used both for the rendered `aria-label` and the demo's info panel.
   */
  get resolvedArialabel(): string {
    return this.arialabel || this.name || ''
  }

  /**
   * When true, the rendered `<ion-icon>` is marked `aria-hidden` and gets no
   * `aria-label` — for icons that are part of a larger decorative group whose
   * *container* carries the meaningful label (e.g. several icons spelling out one
   * word), so a screen reader doesn't announce each fragment separately.
   */
  @Prop() decorative: boolean = false

  /**
   * Color of the icon
   */
  @Prop({ mutable: true }) color: string;

  /**
   * `color` if the consumer set an Ionic theme name, else the actual CSS color the icon
   * renders with (icons colored via `--ae-color`/`--color` instead of `color=` have no
   * `color` prop set at all) — never `undefined`. Used by the demo's info panel.
   */
  get resolvedColor(): string {
    if (this.color) return this.color
    const icon = this.el.shadowRoot?.querySelector('ion-icon')
    return icon ? getComputedStyle(icon).color : ''
  }

  /**
   * Name of the icon
   */
  @Prop({ mutable: true }) name: string;

  /**
   * Url of the icon
   */
  @Prop({ mutable: true }) src: string;

  @Watch('src')
  watchHandler(newValue: string) {
    console.log('The new value of src is: ', newValue);
  }

  /**
   * Title for the panel - visible or hidden
   */
  @Prop() aetitle: string;

  /**
   * State of the panel - visible or hidden
   */
  @State() collapsed: boolean;

  /**
   * Show/Hide the panel
   */
  @Method() async toggle() {
    this.collapsed = !this.collapsed
  }

  /**
   * Result of form submit
   */
  @State() aevalue: string;

  /**
   * Force page render
   */
  @State() tick = {}

  /**
   * Handle for the periodic re-render timer so it can be cleared on teardown.
   */
  private updateTimer: ReturnType<typeof setInterval>;

  constructor() {
    this.iconClicked = this.iconClicked.bind(this)
  }

  /**
   * Start the periodic re-render once the element is in the DOM.
   * (Paired with disconnectedCallback so the timer never outlives the element —
   * an uncleared interval here previously kept Jest/Node alive after tests.)
   */
  connectedCallback() {
    this.applyRotateDeg()
    // the update can be triggered anytime
    this.updateTimer = setInterval(() => this.aeUpdateMethod(), 4000)
  }

  disconnectedCallback() {
    clearInterval(this.updateTimer)
  }

  aeUpdateMethod() {
    // Ref: https://github.com/ionic-team/stencil/issues/185
    this.tick = {} // will trigger re-render
  }

  /**
   * The component is about to load and has not rendered yet.
   * This is the best place to make any data updates
   * before the first render.
   * componentWillLoad will only be called once.
   */
  componentWillLoad() {
    // Register the bundled default icon set for the active source (D2/D3).
    // Idempotent; icons not in the set still fall back to ionicons' runtime fetch.
    registerDefaultIcons(this.set)
    //console.log('Component ae-icon5-component is about to be rendered');
    //console.log('aesize=' + this.aesize + ' name=' + this.name + ' color=' + this.color)
    //console.log(this.el.shadowRoot);
    //console.log('aetype=' + this.aetype);
    // The `aelogos` showcase cycles through six copies of the current ae logo mark,
    // each recolored via nth-child overrides in ae-icon5-component.css. It used to
    // recolor six copies of the pre-issue-#20 logo shape (ae-outline/red-green/
    // yellow/red/green/blue.svg); that shape was retired when the header switched
    // to the current mark (issue #20) but this rotation animation was missed — see
    // issue #31.
    //
    // The first copy is genuinely two-tone, so it uses ae-logo.svg — two same-color
    // <use> instances of one path, colored via --ae-color-imperial/--ae-color-emerald.
    // The other five are single-color, so they use ae.svg instead — the
    // design-system's ae-logo-mono.svg, a single boolean-unioned path colored via
    // plain currentColor (--ae-color). ae-logo.svg's two <use> instances anti-alias
    // independently; set to the same color they leave a faint hairline seam at the
    // stem-meet line (the same bug already fixed in the design system for
    // single-color contexts — see ae.svg's header comment).
    this.aelogos = [
      'assets/aeicons/ae-logo.svg',
      'assets/aeicons/ae.svg',
      'assets/aeicons/ae.svg',
      'assets/aeicons/ae.svg',
      'assets/aeicons/ae.svg',
      'assets/aeicons/ae.svg'
    ]
  }

  handleSubmit(e) {
    e.preventDefault()
    //console.log('handleSubmit: ' + this.aevalue)
    // send data to the backend
    this.getNamigram()
  }

  handleChange(event) {
    this.aevalue = event.target.value
  }

  getNamigram() {
    if (this.aevalue == null) return

    console.log('getNamigram: ' + this.aevalue)
    this.aevalue = null

    this.adaept = 'namigram'
    this.aesize = 'ae64'
    this.namigrams = [
      'assets/aeicons/at.svg', //'one',
      'assets/aeicons/ta.svg' //'two',
    ]

    this.aeUpdateMethod()
    console.log('this.name = ' + this.name)

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
    if (currsizeminus < 8) currsizeminus = initsize
    //console.log(currsizeminus);
  }

  getIconSizePlus() {
    //console.log('getIconSizePlus prevsizeplus = ' + prevsizeplus);
    //console.log('getIconSizePlus this.aesize = ' + this.aesize + ' ' + this.aesize.substr(2));
    currsizeplus = +this.aesize.substr(2) + 8
    if (currsizeplus > maxsize) currsizeplus = 8
    //console.log(currsizeplus);
  }

  /**
   * Fills the demo's #containerDetail/#containerPara click-info panel for the clicked icon.
   * Pulled out of iconClicked's per-case bodies (issue #24 was this exact block missing from
   * one case; issue #26 needs it extended in all of them) so there's one place to keep in
   * sync instead of N copy-pasted blocks.
   */
  private renderInfoPanel(arialabel: string) {
    const detailEl = document.getElementById('containerDetail')
    const paraEl = document.getElementById('containerPara')
    if (!detailEl || !paraEl) return

    // Icons rendered via `src` (the ae logo, adaeptZone marks) have no `name` — fall back to
    // `src` so the panel shows which icon was clicked instead of the literal string
    // "undefined" (issue #27, same root cause as #21's aetype fix).
    const displayName = this.name || this.src || ''

    // Demo-only dev aid (issue #26): link to this icon's first code example in
    // src/index.html, via a build-time name -> line-number map (see
    // scripts/gen-icon-line-map.mjs). Undefined for icons rendered via `src` instead of
    // `name` (e.g. the ae logo), and gracefully absent if the map script hasn't loaded.
    const lineMap = (window as unknown as { AE_ICON_LINE_MAP?: Record<string, number> }).AE_ICON_LINE_MAP
    const line = this.name ? lineMap?.[this.name] : undefined
    const sourceLink = line
      ? ' <b>source:</b> <a href="https://github.com/adaept/ae-icon5-component/blob/master/src/index.html#L' + line +
        '" target="_blank" rel="noopener noreferrer">index.html:' + line + '</a>'
      : ''

    detailEl.innerHTML = '<b>name:</b>' + displayName +
      ' <b>color:</b>' + this.resolvedColor + ' <b>aesize:</b>' + this.aesize + ' <b>aetype:</b>' + (this.aetype || '') +
      ' <b>arialabel:</b>' + arialabel + sourceLink

    paraEl.innerHTML =
      '<ae-icon5-component aesize="ae32" ' +
      ' name=' + displayName +
      ' color=' + this.color +
      ' arialabel=' + arialabel + '>'
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
            this.renderInfoPanel(this.arialabel)
            break
          }
          case 'ae-add-circle': {
            this.getIconSizePlus()
            this.aesize = 'ae' + currsizeplus
            this.renderInfoPanel(this.arialabel)
            break
          }
          case 'ae-refresh-circle': {
            // Reset the SIZE row's +/- icons (demo ids "1"/"2") back to the initial default size.
            currsizeminus = initsize
            currsizeplus = initsize
            const removeIcon = document.getElementById('1') as unknown as HTMLAeIcon5ComponentElement
            const addIcon = document.getElementById('2') as unknown as HTMLAeIcon5ComponentElement
            if (removeIcon) removeIcon.aesize = 'ae' + initsize
            if (addIcon) addIcon.aesize = 'ae' + initsize
            this.renderInfoPanel(this.arialabel)
            break
          }
          default: {
            //statements;
            break
          }
        }
      } else {
        this.renderInfoPanel(this.resolvedArialabel)
      }
    }
  }

  /* Render Label Test example
  [
    <div>
      <ion-content>
        <ion-list>
          <ion-label>Label Test</ion-label>
  { / * {this.aelogos.map((aelogo, index) => ( * / }
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
    if (Boolean(this.src) && Boolean(this.adaept === 'aelogos')) {
      return [
        <div>
          <ion-list>
            {this.aelogos.map((aelogo, index) => (
              <ion-item style={{ '--animation-timimg': index } as any} >
                {/* <ion-label>{index}</ion-label> */}
                <ion-icon class={this.aesize} src={aelogo} color={this.color} aria-label={this.resolvedArialabel} onClick={this.iconClicked}>
                </ion-icon>
              </ion-item>
            ))}
          </ion-list>
        </div>
      ]
    } else if (this.adaept === 'mydataform' || this.adaept === 'mydatapanel') {
      return (
        [
          <div>
            <div id="aeheader" onClick={this.toggle.bind(this)}>
              <span>{this.aetitle}</span>
            </div>
            <div id="aecontent" hidden={this.collapsed}>
              <slot />
            </div>
          </div>,

          <form onSubmit={(e) => this.handleSubmit(e)}>
            <label>
              Name:&nbsp;
              <input type="text" value={this.aevalue} onInput={(event) => this.handleChange(event)} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        ]
      )
    } else if (Boolean(this.src) && Boolean(this.adaept === 'adaept')) {
      return this.decorative
        ? (<ion-icon class={this.aesize} src={this.src} color={this.color} aria-hidden="true" onClick={this.iconClicked}></ion-icon>)
        : (<ion-icon class={this.aesize} src={this.src} color={this.color} aria-label={this.resolvedArialabel} onClick={this.iconClicked}></ion-icon>)
    } else if (this.adaept === 'namigram' || this.adaept === 'mydatapanel') {
      return [
        <div>
          <ion-content>
            <ion-list>
              {this.namigrams.map((namigram, index) => (
                <ion-item style={{ '--animation-timimg': index } as any} >
                  {/* <ion-label>{index}</ion-label> */}
                  <ion-icon class={this.aesize} src={namigram} color={this.color} aria-label={this.resolvedArialabel} onClick={this.iconClicked}>
                  </ion-icon>
                </ion-item>
              ))}
            </ion-list>
          </ion-content>
        </div>
      ]
    } else if (this.name) {
      return (<ion-icon class={this.aesize} name={this.name} color={this.color} aria-label={this.resolvedArialabel} onClick={this.iconClicked}></ion-icon>)
    } else {
      return (null)
    }
  }
}
