import { FormGroup } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MultiselectComponent implements OnInit {

  @Input() name_parent:string;
  @Input() placeholder_parent:string;
  @Input() data_parent:any;
  @Input() form_control_name_parent:string;
  @Input() disabled_parent:boolean;
  @Input() settings_parent:any;
  @Input() form_parent:FormGroup;
  @Output() on_select_event_parent = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  onItemSelect(event){
    this.on_select_event_parent.emit(event);
  }

  /*===================this event can used from parent component===================
  onItemSelect(item: any) {
      console.log('onItemSelect', item);
  }
  onSelectAll(items: any) {
      console.log('onSelectAll', items);
  }
  toogleShowFilter() {
      this.ShowFilter = !this.ShowFilter;
      this.dropdownSettings = Object.assign({}, this.dropdownSettings, { allowSearchFilter: this.ShowFilter });
  }

  handleLimitSelection() {
      if (this.limitSelection) {
          this.dropdownSettings = Object.assign({}, this.dropdownSettings, { limitSelection: 2 });
      } else {
          this.dropdownSettings = Object.assign({}, this.dropdownSettings, { limitSelection: null });
      }
  }
  */

}
