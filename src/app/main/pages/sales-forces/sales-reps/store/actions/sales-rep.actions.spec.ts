import * as fromSalesRep from './sales-rep.actions';

describe('loadSalesReps', () => {
  it('should return an action', () => {
    expect(fromSalesRep.loadSalesReps().type).toBe('[SalesRep] Load SalesReps');
  });
});
