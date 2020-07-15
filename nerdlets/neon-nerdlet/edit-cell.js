import React from 'react';
import PropTypes from 'prop-types';

import { Button, TextField } from 'nr1';

export default class Cell extends React.Component {
  static propTypes = {
    rows: PropTypes.array,
    cols: PropTypes.array,
    cells: PropTypes.array,
    onDataSave: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      rowName: '',
      rowForCell: '',
      colName: '',
      colForCell: '',
      cells: [],
      cellType: '',
      policyName: '',
      attributeName: '',
      isType: '',
      valueName: '',
      editMode: false,
      value: '', //figure out how to show value in edit mode
    };

    this.toggleEdit = this.toggleEdit.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.optionChange = this.optionChange.bind(this);
    this.editData = this.editData.bind(this);
    this.persistData = this.persistData.bind(this);
  }

  toggleEdit(e) {
    e.preventDefault();
    const { editMode } = this.state;
    this.setState({ editMode: !editMode });
  }

  handleEdit(e) {
    this.setState({ value: e.target.value });
  }

  handleCancel(e) {
    e.preventDefault();
    this.setState({ editMode: false });
  }

  changeHandler(e, type) {
    const o = {};
    o[type] = e.target.value;
    this.setState(o);
  }

  optionChange(val, type) {
    const o = {};
    o[type + 'Type'] = val;
    this.setState(o);
  }

  editData(type) {
    const { rows, cols, cells } = this.props;

    if (type === 'row') {
      if (rows.filter(r => r === rowName).length) return;
      rows.push(rowName);
      this.setState(
        {
          rows: rows,
          rowName: '',
        },
        this.persistData(rows, cols, cells)
      );
    } else if (type === 'col') {
      if (cols.filter(c => c === colName).length) return;
      cols.push(colName);
      this.setState(
        {
          cols: cols,
          colName: '',
        },
        this.persistData(rows, cols, cells)
      );
    } else if (type === 'cell') {
      if (
        cells.reduce(
          (a, c) => a || (c.row === rowForCell && c.col === colForCell),
          false
        )
      )
        return;
      if (cellType === 'alert') {
        if (!policyName) return;
        cells.push({
          row: rowForCell,
          col: colForCell,
          policy: policyName,
        });
      } else if (cellType === 'data') {
        if (!attributeName) return;
        const deets = {};
        const attr = attributeName.split(/ as /i);
        if (attr.length === 2) deets.name = attr[1].replace(/[^\w]/gi, '');
        if (attr.length === 1 || attr.length === 2) {
          const attrParts = attr[0].split('(');
          deets.key = (attrParts[1] || attrParts[0]).replace(/[^\w]/gi, '');
          deets.func =
            attrParts.length === 2
              ? attrParts[0].replace(/[^\w]/gi, '')
              : 'latest';
        }
        if (!('name' in deets)) deets.name = deets.func + '_' + deets.key;
        deets.str = deets.func + '(`' + deets.key + '`)' + ' AS ' + deets.name;
        deets.is = isType;
        deets.value = valueName;
        cells.push({
          row: rowForCell,
          col: colForCell,
          attribute: attributeName,
          details: deets,
        });
      }
      this.setState(
        {
          cells: cells,
          rowForCell: '',
          colForCell: '',
          cellType: '',
          policyName: '',
          attributeName: '',
          isType: '',
          valueName: '',
        },
        this.persistData(rows, cols, cells)
      );
    }
  }

  persistData(rows, cols, cells) {
    const { onSave } = this.props;
    if (onSave) onSave(rows, cols, cells);
  }

  // TODO: Make edit with pencil, enable when user clicks, add save
  // TODO: Style save and cancel buttons
  render() {
    const selectStyle = {
      minWidth: '128px',
      minHeight: '33px',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      padding: '6.5px 8px',
      fontSize: '14px',
      position: 'relative',
      lineHeight: '19px',
      border: 'none',
      boxShadow:
        'inset 0 0 0 1px #d5d7d7, inset 0px 3px 0px rgba(0, 0, 0, 0.02)',
      backgroundPosition: 'right 8px top 56%',
      borderRadius: '3px',
      backgroundColor: '#fff',
      transition: '0.075s all ease-in-out',
      left: 0,
    };

    const {
      rowName,
      rowForCell,
      colName,
      colForCell,
      cellType,
      policyName,
      attributeName,
      isType,
      valueName,
      value,
      editMode,
    } = this.state;
    const { rows, cols, cells } = this.props;

    return (
      <div>
        {editMode ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gridGap: '1em',
              marginTop: '2em',
            }}
          >
            <select
              style={selectStyle}
              value={rowForCell || ''}
              onChange={e => this.changeHandler(e, 'rowForCell')}
            >
              <option value="">SELECT A ROW</option>
              {rows.map((r, i) => (
                <option value={r} key={i}>
                  {r}
                </option>
              ))}
            </select>
            <select
              style={selectStyle}
              value={colForCell || ''}
              onChange={e => this.changeHandler(e, 'colForCell')}
            >
              <option value="">SELECT A COLUMN</option>
              {cols.map((c, i) => (
                <option value={c} key={i}>
                  {c}
                </option>
              ))}
            </select>
            <select
              style={selectStyle}
              value={cellType || ''}
              onChange={e => this.changeHandler(e, 'cellType')}
            >
              <option value="">SELECT DATA TYPE</option>
              <option value="alert">New Relic Alert</option>
              <option value="data">New Relic Attribute</option>
            </select>
            {cellType === 'alert' && (
              <TextField
                label="Alert Policy"
                placeholder=""
                onChange={e => this.changeHandler(e, 'policyName')}
                value={policyName}
              />
            )}
            {cellType === 'data' && (
              <div>
                <TextField
                  label="Attribute Name"
                  placeholder=""
                  onChange={e => this.changeHandler(e, 'attributeName')}
                  value={attributeName}
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3fr 1fr',
                    gridGap: '.5em',
                    marginTop: '.75em',
                  }}
                >
                  <select
                    value={isType || ''}
                    onChange={e => this.changeHandler(e, 'isType')}
                    style={{ alignSelf: 'end', ...selectStyle }}
                  >
                    <option value="">COMPARISON</option>
                    <option value="less">less than</option>
                    <option value="equal">equals</option>
                    <option value="more">greater than</option>
                  </select>
                  <TextField
                    label="Value"
                    placeholder=""
                    onChange={e => this.changeHandler(e, 'valueName')}
                    value={valueName}
                  />
                </div>
              </div>
            )}
            <Button
              className="btn-spacing"
              iconType={Button.ICON_TYPE.INTERFACE__SIGN__CHECKMARK}
              sizeType={Button.SIZE_TYPE.MEDIUM}
              type={Button.TYPE.PRIMARY}
              onClick={() => onDataSave(value, index, type)}
            >
              Save
            </Button>
            <Button
              className="btn-spacing"
              iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__UNDO}
              sizeType={Button.SIZE_TYPE.MEDIUM}
              type={Button.TYPE.NEUTRAL}
              onClick={this.handleCancel}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gridGap: '1em',
              marginTop: '2em',
            }}
          >
            <select style={selectStyle} disabled>
              <option value="">SELECT A ROW</option>
            </select>
            <select style={selectStyle}>
              <option value="">SELECT A COLUMN</option>
            </select>
            <select style={selectStyle}>
              <option value="">SELECT DATA TYPE</option>
              <option value="alert">New Relic Alert</option>
              <option value="data">New Relic Attribute</option>
            </select>
            <Button
              className="btn-spacing"
              iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EDIT}
              sizeType={Button.SIZE_TYPE.MEDIUM}
              onClick={this.toggleEdit}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    );
  }
}
