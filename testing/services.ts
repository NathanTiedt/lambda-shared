
export class TestServices {

  constructor() {}

  createPgClient(query?: any, connect?: any, close?: any) {
    return {
      connect: connect || (async () => true),
      close: close || (async () => true),
      query: query || (async () => { 
        return {
          rows: [{column: 'value'}],
          rowCount: 1,
        };
      }),
    };
  }

}
