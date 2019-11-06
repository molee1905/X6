import React from 'react'
import { Checkbox, InputNumber, Select } from 'antd'
import { ColorResult } from 'react-color'
import { ColorPicker } from '../../../components'
import { getEditor } from '../index'
import './format.less'
import { GuideOptions } from '../../../../../src/handler/guide/option'
import { PageSize } from '../../../../../src'

export class FormatDiagram extends React.PureComponent {
  state = {
    grid: true,
    gridSize: 10,
    minGridSize: 4,
    gridColor: '#ff0000',
    guide: true,
    pageView: true,
    pageSize: 'a4',
  }

  get editor() {
    return getEditor()
  }

  get graph() {
    return this.editor.graph
  }

  componentDidMount() {
    const graph = this.graph
    const guideOptions = graph.options.guide as GuideOptions

    this.setState({
      grid: graph.gridEnabled,
      gridSize: graph.gridSize,
      minGridSize: graph.view.minGridSize,
      gridColor: graph.view.gridColor,
      guide: guideOptions.enabled,
      pageView: graph.pageVisible,
    })
  }

  onGridEnableChange = (e: any) => {
    const graph = this.graph
    const checked = e.target.checked

    graph.gridEnabled = checked
    graph.view.validate()

    this.setState({
      grid: checked,
    })
  }

  onGridColorChange = (value: ColorResult) => {
    const graph = this.graph
    graph.view.gridColor = value.hex
    graph.view.validateBackgroundPage()
    this.setState({
      gridColor: value.hex,
    })
  }

  onGridSizeChange = (value: number) => {
    this.graph.gridSize = value
    this.graph.view.validate()
    this.setState({ gridSize: value })
  }

  onGuideEnableChang = (e: any) => {
    const checked = e.target.checked
    const graph = this.graph
    const guideOptions = graph.options.guide as GuideOptions

    guideOptions.enabled = checked
    this.setState({
      guide: checked,
    })
  }

  onPageSizeChange = (value: string) => {
    const sizes = {
      letter: PageSize.LETTER_PORTRAIT,
      legal: PageSize.LETTER_PORTRAIT,
      a0: PageSize.A0,
      a1: PageSize.A1,
      a2: PageSize.A2,
      a3: PageSize.A3,
      a4: PageSize.A4,
      a5: PageSize.A5,
      a6: PageSize.A6,
      a7: PageSize.A7,
    }

    const size = (sizes as any)[value]
    if (size) {
      this.setState({ pageSize: value })
      this.graph.pageFormat = { width: size.width, height: size.height }
      this.graph.view.validate()
    }
  }

  render() {
    return (
      <div className="x6-editor-format-wrap">
        <div className="x6-editor-format-title">
          Diagram
        </div>
        <div className="x6-editor-format-content">
          <div className="x6-editor-format-section ">
            <div className="section-title">View</div>
            <div className="section-item">
              <Checkbox
                checked={this.state.grid}
                style={{ width: 88 }}
                onChange={this.onGridEnableChange}
              >
                Grid
              </Checkbox>
              <InputNumber
                min={this.state.minGridSize}
                value={this.state.gridSize}
                style={{ width: 56 }}
                onChange={this.onGridSizeChange}
              />
              <ColorPicker
                value={this.state.gridColor}
                onChange={this.onGridColorChange}
                style={{ width: 56, marginLeft: 8 }}
              />
            </div>
            <div className="section-item">
              <Checkbox
                checked={this.state.guide}
                onChange={this.onGuideEnableChang}
              >
                Snap Lines
              </Checkbox>
            </div>
          </div>
          <div className="x6-editor-format-section ">
            <div className="section-title">Page Size</div>
            <div className="section-item">
              <Select
                style={{ width: '100%' }}
                value={this.state.pageSize}
                onChange={this.onPageSizeChange}
              >
                <Select.Option value="letter">US-Letter (8,5" x 11")</Select.Option>
                <Select.Option value="legal">US-Legal (8,5" x 14")</Select.Option>
                <Select.Option value="a0">A0 (841 mm x 1189 mm)</Select.Option>
                <Select.Option value="a1">A1 (594 mm x 841 mm)</Select.Option>
                <Select.Option value="a2">A2 (420 mm x 594 mm)</Select.Option>
                <Select.Option value="a3">A3 (297 mm x 420 mm)</Select.Option>
                <Select.Option value="a4">A4 (210 mm x 297 mm)</Select.Option>
                <Select.Option value="a5">A5 (148 mm x 210 mm)</Select.Option>
                <Select.Option value="a6">A6 (105 mm x 148 mm)</Select.Option>
                <Select.Option value="a7">A7 (74 mm x 105 mm)</Select.Option>
              </Select>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export namespace FormatDiagram {
  export interface Props { }

  export interface State {
    grid: boolean
    gridSize: number
    minGridSize: number,
    gridColor: string
    guide: boolean
    pageView: boolean
    pageSize: string
  }
}
