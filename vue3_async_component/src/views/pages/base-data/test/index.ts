interface ShowMessage {
  (options: object): void
  (text: string, onClose?: Function): void
  (text: string, mode: string, duration?: number): void
  (text: string, duration?: number, onClose?: Function): void
}

interface Utils {
  showMessage: ShowMessage
}

const utils: Utils = {
  //   showMessage(param1: string | object, params2?: number | Function | string, params3?: number | Function) {
  //     console.log('param1', param1)
  //     console.log('params2', params2)
  //     console.log('params3', params3)
  //   },
  showMessage(...args: any[]) {
    console.log('args', args)
  }
}
