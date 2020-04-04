export interface ChildrenOfTree {
    [key: number]: Array<SelectionTree>;
}

export interface SelectedTree {
    selected: SelectionTree;
    selectedString: string;
}

interface ISelectionTree {
    id: string;
    parentId: string;
    group: string;
    name: string;
    sequence?: number;
    hasChild: boolean;
    description: string;
    isActive: boolean;
}

export class SelectionTree {
    id: string;
    parentId: string;
    group: string;
    name: string;
    sequence: number;
    hasChild: boolean;
    description: string;
    isActive: boolean;

    constructor(data: ISelectionTree) {
        const {
            id,
            parentId,
            group,
            name,
            sequence,
            hasChild,
            description,
            isActive,
        } = data;

        this. id = id;
        this. parentId = parentId;
        this. group = group;
        this. name = name;
        this. sequence = sequence;
        this. hasChild = hasChild;
        this. description = description;
        this. isActive = isActive;
    }
}
