import JQuery from 'jquery'
import 'jquery-mousewheel'
import { Dom } from '../util'
import { ModifierKey } from '../types'
import { Disposable, IDisablable } from '../common'
import { Graph } from './graph'

export class MouseWheel extends Disposable implements IDisablable {
  public readonly target: HTMLElement | Document
  public readonly container: HTMLElement
  protected frameId: number | null
  protected cumulatedFactor: number = 1
  protected currentScale: number | null
  protected startPos: { x: number; y: number }
  protected readonly handler: (
    e: JQueryMousewheel.JQueryMousewheelEventObject,
  ) => any

  protected get graph() {
    return this.options.graph
  }

  constructor(public readonly options: MouseWheel.Options) {
    super()

    const scroller = this.graph.scroller.widget
    this.container = scroller ? scroller.container : this.graph.container
    this.target = this.options.global ? document : this.container
    this.handler = this.onMouseWheel.bind(this)

    if (this.options.enabled) {
      this.enable(true)
    }
  }

  get disabled() {
    return this.options.enabled !== true
  }

  enable(force?: boolean) {
    if (this.disabled || force) {
      this.options.enabled = true
      this.graph.options.keyboard.enabled = true
      JQuery(this.target).on('mousewheel', this.handler)
    }
  }

  disable() {
    if (!this.disabled) {
      this.options.enabled = false
      this.graph.options.keyboard.enabled = false
      JQuery(this.target).off('mousewheel')
    }
  }

  protected onMouseWheel(evt: JQueryMousewheel.JQueryMousewheelEventObject) {
    if (ModifierKey.test(evt as any, this.options.modifiers)) {
      evt.preventDefault()
      evt.stopPropagation()

      if (this.frameId) {
        Dom.cancelAnimationFrame(this.frameId)
        this.frameId = null
      }

      const deltaY = evt.deltaY * evt.deltaFactor
      const factor = this.options.factor || 1.2

      if (this.currentScale == null) {
        this.startPos = { x: evt.clientX, y: evt.clientY }
        this.currentScale = this.graph.scroller.widget
          ? this.graph.scroller.widget.zoom()
          : this.graph.scale().sx
      }

      const delta = deltaY

      if (delta > 0) {
        // zoomin
        // ------
        // Switches to 1% zoom steps below 15%
        if (this.currentScale * this.cumulatedFactor < 0.15) {
          this.cumulatedFactor = (this.currentScale + 0.01) / this.currentScale
        } else {
          // Uses to 5% zoom steps for better grid rendering in
          // webkit and to avoid rounding errors for zoom steps
          this.cumulatedFactor *= factor
        }
      } else {
        // zoomout
        // -------
        // Switches to 1% zoom steps below 15%
        if (this.currentScale * this.cumulatedFactor <= 0.15) {
          this.cumulatedFactor = (this.currentScale - 0.01) / this.currentScale
        } else {
          // Uses to 5% zoom steps for better grid rendering in
          // webkit and to avoid rounding errors for zoom steps
          this.cumulatedFactor /= factor
        }
      }

      this.cumulatedFactor =
        Math.round(this.currentScale * this.cumulatedFactor * 20) /
        20 /
        this.currentScale

      this.cumulatedFactor = Math.max(
        0.01,
        Math.min(this.currentScale * this.cumulatedFactor, 160) /
          this.currentScale,
      )

      this.frameId = Dom.requestAnimationFrame(() => {
        const scroller = this.graph.scroller.widget
        const currentScale = this.currentScale!
        const targetScale = this.graph.transform.clampScale(
          currentScale * this.cumulatedFactor,
        )

        if (targetScale !== currentScale) {
          if (scroller) {
            if (this.options.fixed) {
              const origin = this.graph.coord.clientToLocalPoint(this.startPos)
              scroller.zoom(targetScale, {
                absolute: true,
                ox: origin.x,
                oy: origin.y,
              })
            } else {
              scroller.zoom(targetScale, { absolute: true })
            }
          } else {
            const point = this.options.fixed
              ? this.graph.coord.clientToLocalPoint(this.startPos)
              : null

            this.graph.scale(targetScale, targetScale)

            if (point != null) {
              this.graph.translate(
                point.x * (1 - targetScale),
                point.y * (1 - targetScale),
              )
            }
          }
        }

        this.frameId = null
        this.currentScale = null
        this.cumulatedFactor = 1
      })
    }
  }

  @Disposable.dispose()
  dispose() {
    this.disable()
  }
}

export namespace MouseWheel {
  export interface Options {
    graph: Graph
    enabled?: boolean
    global?: boolean
    factor?: number
    fixed?: boolean
    modifiers?: string | ModifierKey[] | null
    guard?: (this: Graph, e: KeyboardEvent) => boolean
  }
}
