interface IFilter {
    // Sebagai identitas unik setiap filter.
    id: string;
    // Untuk ditampilkan di front-end.
    title: string;
    // Untuk menyimpan nilai filter-nya.
    value: {
        // Untuk ditampilkan di front-end.
        title: string;
        // Untuk dikirim ke back-end.
        value: string;
    };
}

export class Filter implements IFilter {
    // Sebagai identitas unik setiap filter.
    id: string;
    // Untuk ditampilkan di front-end.
    title: string;
    // Untuk menyimpan nilai filter-nya.
    value: {
        // Untuk ditampilkan di front-end.
        title: string;
        // Untuk dikirim ke back-end.
        value: string;
    };

    constructor(filter: IFilter) {
        const {
            id,
            title,
            value
        } = filter;

        this.id = id;
        this.title = title;
        this.value = value;
    }
}
