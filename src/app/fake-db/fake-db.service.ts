import { InMemoryDbService } from 'angular-in-memory-web-api';
import { AcademyFakeDb } from 'app/fake-db/academy';
import { CalendarFakeDb } from 'app/fake-db/calendar';
import { ChatFakeDb } from 'app/fake-db/chat';
import { ChatPanelFakeDb } from 'app/fake-db/chat-panel';
import { ContactsFakeDb } from 'app/fake-db/contacts';
import { AnalyticsDashboardDb } from 'app/fake-db/dashboard-analytics';
import { ProjectDashboardDb } from 'app/fake-db/dashboard-project';
import { ECommerceFakeDb } from 'app/fake-db/e-commerce';
import { FaqFakeDb } from 'app/fake-db/faq';
import { FileManagerFakeDb } from 'app/fake-db/file-manager';
import { IconsFakeDb } from 'app/fake-db/icons';
import { InvoiceFakeDb } from 'app/fake-db/invoice';
import { KnowledgeBaseFakeDb } from 'app/fake-db/knowledge-base';
import { MailFakeDb } from 'app/fake-db/mail';
import { ProfileFakeDb } from 'app/fake-db/profile';
import { QuickPanelFakeDb } from 'app/fake-db/quick-panel';
import { ScrumboardFakeDb } from 'app/fake-db/scrumboard';
import { SearchFakeDb } from 'app/fake-db/search';
import { TodoFakeDb } from 'app/fake-db/todo';
import { StoresFakeDb } from './stores';

export class FakeDbService implements InMemoryDbService {
    createDb(): any {
        return {
            // Dashboards
            'project-dashboard-projects': ProjectDashboardDb.projects,
            'project-dashboard-widgets': ProjectDashboardDb.widgets,
            'analytics-dashboard-widgets': AnalyticsDashboardDb.widgets,

            // Calendar
            "calendar": CalendarFakeDb.data,

            // E-Commerce
            'e-commerce-products': ECommerceFakeDb.products,
            'e-commerce-orders': ECommerceFakeDb.orders,

            // Academy
            'academy-categories': AcademyFakeDb.categories,
            'academy-courses': AcademyFakeDb.courses,
            'academy-course': AcademyFakeDb.course,

            // Mail
            'mail-mails': MailFakeDb.mails,
            'mail-folders': MailFakeDb.folders,
            'mail-filters': MailFakeDb.filters,
            'mail-labels': MailFakeDb.labels,

            // Chat
            'chat-contacts': ChatFakeDb.contacts,
            'chat-chats': ChatFakeDb.chats,
            'chat-user': ChatFakeDb.user,

            // File Manager
            'file-manager': FileManagerFakeDb.files,

            // Contacts
            'contacts-contacts': ContactsFakeDb.contacts,
            'contacts-user': ContactsFakeDb.user,

            // Todo
            'todo-todos': TodoFakeDb.todos,
            'todo-filters': TodoFakeDb.filters,
            'todo-tags': TodoFakeDb.tags,

            // Scrumboard
            'scrumboard-boards': ScrumboardFakeDb.boards,

            // Invoice
            "invoice": InvoiceFakeDb.invoice,

            // Profile
            'profile-timeline': ProfileFakeDb.timeline,
            'profile-photos-videos': ProfileFakeDb.photosVideos,
            'profile-about': ProfileFakeDb.about,

            // Search
            "search": SearchFakeDb.search,

            // FAQ
            "faq": FaqFakeDb.data,

            // Knowledge base
            'knowledge-base': KnowledgeBaseFakeDb.data,

            // Icons
            "icons": IconsFakeDb.icons,

            // Chat Panel
            'chat-panel-contacts': ChatPanelFakeDb.contacts,
            'chat-panel-chats': ChatPanelFakeDb.chats,
            'chat-panel-user': ChatPanelFakeDb.user,

            // Quick Panel
            'quick-panel-notes': QuickPanelFakeDb.notes,
            'quick-panel-events': QuickPanelFakeDb.events,

            // Stores
            "stores": StoresFakeDb.stores
        };
    }
}
