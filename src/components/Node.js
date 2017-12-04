import React from 'react'
import {Input, Button, Checkbox, Icon} from 'antd'

export default class Node extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({
      list: this.getList(this.props.list, this.props.parent)
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      list: this.getList(nextProps.list, nextProps.parent)
    })
  }

  getList(list, parent) {
    return list.filter(thing => thing.parentId === parent);
  }

  render() {
    return (
      <div className="thing-list">
        {this.state.list.map((thing, index) => (
          <div className="thing-container" key={thing.id}>
            { !thing.editable ?
              <div className="content">
                <Checkbox checked={thing.did}
                          indeterminate={thing.indeterminate}
                          onChange={(e) => this.props.changeStatus(thing.id, e.target.checked, thing.parentId)}/>
                {thing.childrenId.length > 0 && <Icon type={thing.showDetail ? 'down' : 'right'}
                                                      onClick={() => this.props.changeShowDetail(thing.id)}
                                                      style={{display: 'inline-block', margin: '0 10px'}}/>}
                <span className={thing.did ? 'did-content' : ''}>{index + 1}. {thing.content}</span>
                <div className='btn-group'>
                  <Button onClick={() => this.props.changeContent(thing.id)}>改改改</Button>
                  <Button onClick={() => this.props.addThing(thing.id)}>细一点</Button>
                  <Button onClick={() => this.props.deleteThing(thing.id, this.props.parent, thing.childrenId)}>不要了</Button>
                </div>
              </div> :
              <div style={{display: 'inline-block'}}>
                {index+1}<Input className="content-input"
                                style={{width: '200px'}}
                                ref={thing.id}
                                onBlur={(e) => this.props.changeContent(thing.id, e.target.value)}
                                defaultValue={thing.content}/>
                <Button className="edit-btn">就酱</Button>
              </div>
            }
            {(thing.childrenId.length > 0 && thing.showDetail) &&
            <Node list={this.props.list} parent={thing.id}
                  addThing={this.props.addThing}
                  deleteThing={this.props.deleteThing}
                  changeStatus={this.props.changeStatus}
                  changeContent={this.props.changeContent}
                  changeShowDetail={this.props.changeShowDetail}/>}
          </div>
        ))}
      </div>
    )
  }

}
