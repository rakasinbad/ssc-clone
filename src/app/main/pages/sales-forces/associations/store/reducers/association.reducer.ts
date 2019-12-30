import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

// import { StoreCatalogue } from '../../models';
import { AssociationActions } from '../actions';
import { Association } from '../../models/associations.model';
