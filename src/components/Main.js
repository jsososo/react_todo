require('normalize.css/normalize.css');
require('styles/App.css');
require('antd/dist/antd.css');

import React from 'react';
import {Input, Button, Modal} from 'antd'
import Node from './Node'

const storage = window.localStorage;
const {TextArea} = Input;

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      list: {},
      did: 0,
      undo: 0
    }

    this.updateUndo = this.updateUndo.bind(this);
    this._delete = this._delete.bind(this);
  }

  componentWillMount() {
    let list = JSON.parse(storage.getItem('todoList'));
    list = list ? list : {
      list: [],
      nextId: 1
    };

    this.updateUndo(list)
  }

  //更新undo数量
  updateUndo(list) {
    list = list ? list : this.state.list;
    let [did, undo] = [0, 0];
    //获取层级最顶层的事
    let sons = list.list.filter(thing => thing.parentId === 0);
    sons.forEach(thing => {
      if (thing.did) {
        did++;
      } else {
        undo++
      }
    })
    storage.setItem('todoList', JSON.stringify(list))
    this.setState({
      list,
      did,
      undo,
      num: sons.length
    })
  }

  //增加一件事
  addThing(parentId) {
    let list = this.state.list;
    list.list.push({
      content: '没事找事',
      did: false,
      editable: false,
      parentId: parentId,
      childrenId: [],
      id: list.nextId,
      indeterminate: false,
      showDetail: true
    })

    list.list.map(thing => {
      thing.editable = false;
      if (thing.id === parentId) {
        thing.childrenId.push(list.nextId)
      }
    })

    list.nextId++;

    this.updateUndo(list);
  }

  //获取这个旗下的所有子事件(不包括这个事件本身)
  getAllChildren(id) {
    let ids = []
    let list = this.state.list.list;
    list.forEach(thing => {
      if (thing.parentId === id) {
        ids.push(thing.id);

        if (thing.childrenId.length > 0) {
          ids = [...ids, ...this.getAllChildren(thing.id)]
        }
      }
    })
    return ids;
  }

  //删除事件确认弹窗
  deleteThing(id, parentId, childrenId) {
    if (childrenId.length > 0) {
      Modal.confirm({
        title: '确定要删除？',
        content: '删除会导致该事件下的所有子事件也被删除',
        onOk: () => {
          this._delete(id, parentId)
        }
      })
    } else {
      this._delete(id, parentId)
    }
  }

  //删除一个事件和他的子事件
  _delete(id, parentId) {
    let list = this.state.list;
    let deleteIds = [id, ...this.getAllChildren(id)];
    list.list = list.list.filter(thing => deleteIds.indexOf(thing.id) < 0);

    list.list.map(thing => {
      thing.editable = false;
      if (thing.id === parentId) {
        thing.childrenId = thing.childrenId.filter(c => c.id !== id );
      }
    })

    this.updateUndo(list);
  }

  //修改一件事和他的子事件did状态
  changeStatus(id, val, parentId) {
    let list = this.state.list;
    let changeIds = [id, ...this.getAllChildren(id)]

    list.list.map(thing => {
      if (changeIds.indexOf(thing.id) > -1) {
        thing.did = val;
        thing.indeterminate = false;
      }
    })
    if (parentId) {
      this.changeParentStatus(parentId, val, list.list)
    }
    this.updateUndo(list)
  }

  //判断是否要改变父事件的did状态
  changeParentStatus(parentId, val, list) {
    let parent = list.find(thing => thing.id === parentId);
    let stopFun = false;
    list.map(thing => {
      if (parent.childrenId.indexOf(thing.id) > -1) {
        //兄弟事件存在不同状态，父事件为半选中
        if (val !== thing.did) {
          parent.did = false;
          parent.indeterminate = true;
          stopFun = true;
        }
      }
    })
    if(!stopFun) {
      //子事件状态相同，父事件肯定需要改变状态
      parent.did = val;
      parent.indeterminate = false;
    }
    //继续向上检查
    if (parent.parentId) {
      this.changeParentStatus(parent.parentId, val, list)
    }
  }

  //修改一件事的内容
  changeContent(id, val) {
    let list = this.state.list;

    list.list.map(thing => {
      //找到要修改的事件
      if (thing.id === id) {
        if (val !== undefined) {
          thing.content = val
        }
        thing.editable = !thing.editable;
      } else {
        thing.editable = false;
      }
    })

    this.setState({
      list
    })
  }

  changeShowDetail(id) {
    let list = this.state.list;
    let thing = list.list.find(thing => thing.id === id);
    thing.showDetail = !thing.showDetail;

    this.updateUndo(list);
  }

  render() {
    return (
      <div className="container">
        {this.state.num === 0 ? '无所事事~' :
          <div className="page-title">
            一共{this.state.num}件事，
            {this.state.undo === 0 ? '全做完啦~~' : `还剩${this.state.undo}件事，emmmmm`}
          </div>
        }
        <div className="thing-container">
          <Node list={this.state.list.list} parent={0}
                addThing={this.addThing.bind(this)}
                deleteThing={this.deleteThing.bind(this)}
                changeStatus={this.changeStatus.bind(this)}
                changeContent={this.changeContent.bind(this)}
                changeShowDetail={this.changeShowDetail.bind(this)}/>
          {/*新增一件事*/}
          <div className="add-btn" onClick={() => this.addThing(0)}>来活了！</div>
        </div>
      </div>
    );
  }
}

export default AppComponent;
