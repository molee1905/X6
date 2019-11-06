import React from 'react'
import { Editor } from './editor'

let editor: Editor

export function getEditor() {
  return editor
}

export default class X6Editor extends React.Component {
  private container: HTMLDivElement

  componentDidMount() {
    editor = new Editor(this.container)
  }

  refContainer = (container: HTMLDivElement) => {
    this.container = container
  }

  render() {
    return (
      <div
        ref={this.refContainer}
        tabIndex={0}
        className="x6-graph-container"
      />
    )
  }
}
