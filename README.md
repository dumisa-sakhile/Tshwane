# Tshwane Economic Hub

A comprehensive digital platform designed to unlock innovation and economic opportunities for township entrepreneurs in South Africa. The platform connects township businesses with funding opportunities, educational resources, and digital tools to grow their enterprises.

## 🌟 Features

### Core Services

- **🏦 Funding Application Portal** - Streamlined access to business funding opportunities
- **📚 Business Workshops** - Educational programs covering digital skills, financial literacy, and entrepreneurship
- **👁️ Market Visibility Tools** - Digital marketing and business listing services
- **🤝 Mergers & Acquisitions** - Secure document management and partnership facilitation
- **🌐 Broadband Access Initiatives** - Connectivity support through ISP partnerships

### Platform Highlights

- 🔐 **Secure Authentication** - Firebase Auth with Google Sign-in and email link authentication
- 🏢 **Role-based Access** - Different access levels for users and administrators
- 💳 **Subscription Plans** - Free, Standard (R99/month), and Premium (R149/month) tiers
- 🎨 **Modern UI** - Built with Tailwind CSS and Shadcn/ui components

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- React.js V19 +
- npm or yarn package manager
- Firebase account for authentication and database

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dumisa-sakhile/tshwane-economic-hub.git
   cd tshwane-economic-hub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   npm run start
   ```
   The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This will create optimized production files in the `dist` directory.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components (button, card, input, etc.)
│   ├── AuthForm.tsx    # Authentication form component
│   ├── Header.tsx      # Navigation header
│   ├── Loading.tsx     # Loading component with animations
│   ├── SignupForm.tsx  # User registration form
│   └── SubscriptionGate.tsx # Paywall and subscription management
├── config/
│   └── firebase.ts     # Firebase configuration and initialization
├── lib/
│   └── utils.ts        # Utility functions and helpers
├── routes/             # File-based routing structure
│   ├── __root.tsx      # Root layout component
│   ├── index.tsx       # Homepage with hero section
│   ├── pricing.tsx     # Service plans and pricing
│   ├── auth/           # Authentication routes
│   │   ├── index.tsx   # Login/signup page
│   │   └── verify.tsx  # Email verification
│   └── dashboard/      # Protected dashboard routes
│       ├── route.tsx   # Dashboard layout
│       ├── index.tsx   # Dashboard home
│       ├── broadband.tsx    # Broadband initiatives
│       ├── documents.tsx    # Document management
│       ├── funding.tsx      # Funding applications
│       ├── visibility.tsx   # Market visibility tools
│       ├── workshops.tsx    # Workshop management
│       └── admin/           # Admin-only routes
├── styles.css          # Global styles and Tailwind imports
└── main.tsx           # Application entry point
```

## 🛠️ Tech Stack

### Frontend

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript development
- **TanStack Router** - File-based routing with type safety
- **TanStack Query** - Server state management and caching
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Shadcn/ui** - Pre-built accessible component library
- **Lucide React** - Beautiful icon library

### Backend & Services

- **Firebase Auth** - User authentication and management
- **Cloud Firestore** - NoSQL database for real-time data
- **Vercel Blob** - File storage and management
- **React Hot Toast** - Toast notifications

### Development Tools

- **Vite 6.x** - Fast build tool and dev server
- **Vitest** - Unit testing framework
- **TypeScript** - Static type checking
- **ESLint** - Code linting and quality
- **date-fns** - Date manipulation library

## 📊 Subscription Plans

### Free Plan (R0/month)

- ✅ Funding Application Portal
- ❌ Business Workshops
- ❌ Mergers and Acquisitions
- ❌ Market Visibility Tools
- ❌ Broadband Access Initiatives

### Standard Plan (R99/month)

- ✅ Funding Application Portal
- ✅ Business Workshops
- ✅ Mergers and Acquisitions
- ❌ Market Visibility Tools
- ❌ Broadband Access Initiatives

### Premium Plan (R149/month)

- ✅ All Standard features
- ✅ Market Visibility Tools
- ✅ Broadband Access Initiatives
- ✅ Priority support
- ✅ Advanced analytics

## 🔒 Security & Authentication

The platform implements robust security measures:

- **Firebase Authentication** - Secure user management
- **Email Link Authentication** - Passwordless login system
- **Google Sign-in** - Social authentication integration
- **Role-based Access Control** - Admin and user permissions
- **Input Validation** - Form validation and sanitization
- **Secure File Uploads** - Protected document management

## 📱 Mobile & Accessibility

- **Low Bandwidth Optimization** - Optimized for township internet conditions
- **Progressive Web App** - PWA features for mobile installation
- **WCAG 2.1 Compliance** - Accessibility standards adherence

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

The project uses Vitest with:

- **Component Testing** - React Testing Library integration
- **Unit Tests** - Logic and utility function testing
- **Mock Services** - Firebase service mocking
- **DOM Testing** - jsdom environment

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**

   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Environment Variables**
   Configure your environment variables in the Vercel dashboard

3. **Custom Domain**
   Set up your custom domain in Vercel settings

### Manual Deployment

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Serve the files**

   ```bash
   npm run serve
   ```

3. **Deploy the `dist` folder** to your hosting provider

## 🎯 Key Features Deep Dive

### Dashboard Features

- **📊 Analytics Dashboard** - User engagement and application metrics
- **📝 Application Management** - Track funding application status
- **🎓 Workshop Booking** - Educational program registration
- **📄 Document Center** - Secure document upload and management
- **🌐 Visibility Tools** - Business listing and marketing features

### Admin Features

- **👥 User Management** - Admin panel for user administration
- **📈 Application Review** - Funding application approval system
- **📚 Workshop Management** - Create and manage educational programs
- **📊 Analytics** - Platform usage and success metrics

## 📈 Performance Features

- **Code Splitting** - Route-based lazy loading
- **Image Optimization** - Responsive images with proper sizing
- **Bundle Optimization** - Tree shaking and minimization
- **Caching Strategies** - Efficient data caching with TanStack Query
- **CDN Delivery** - Fast content delivery through Vercel

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript strict mode
- Use conventional commit messages
- Add tests for new features
- Ensure responsive design
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support & Contact

For support and questions:

- **Issues**: [GitHub Issues](https://github.com/dumisa-sakhile/tshwane-economic-hub/issues)
- **Documentation**: [Project Wiki](https://github.com/dumisa-sakhile/tshwane-economic-hub/wiki)

## 🙏 Acknowledgments

- **TanStack** - For the excellent router and query libraries
- **Firebase** - For authentication and database services
- **Vercel** - For hosting and blob storage solutions
- **Shadcn** - For the beautiful UI component library
- **Township entrepreneurs** - For inspiring this platform

## 👥 Meet Our Team

<div align="center">
  <img src="./public/team.jpg" alt="Tshwane Economic Hub Team" width="600" style="border-radius: 12px; margin-bottom: 20px;" />
</div>

The dedicated team behind Tshwane Economic Hub:

- **Quintene Mahlalela**
- **Awethu Mazibuko**
- **Seshane Mahlo**
- **Thuli Makobe**
- **Mabo Giqwa**
- **Sakhile Dumisa**
- **Seshane Selby**
- **Samukelisiwe Felicity**

## 🗺️ Development Roadmap

### Current Phase (Q4 2025)

- ✅ User authentication and profiles
- ✅ Subscription management system
- ✅ Funding application portal
- ✅ Workshop management system
- 🔄 Enhanced admin dashboard

### Next Phase (Q1 2026)

- 📱 Mobile app development (React Native)
- 🤖 AI-powered funding recommendations
- 📧 SMS/Email notification system
- 🏦 Banking API integrations
- 📊 Advanced analytics and reporting

### Future Enhancements (Q2-Q3 2026)

- 🌍 Multi-language support (Zulu, Xhosa, Afrikaans, Sesotho)
- 🛒 Township business marketplace
- 🎥 Video conference integration for workshops
- 📱 Offline-first mobile capabilities
- 🤝 Partnership integrations with local institutions

---

**Made with ❤️ for South African township entrepreneurs**

_Empowering communities through digital innovation and economic opportunities_
import { Link } from "@tanstack/react-router";

````

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
````

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json() as Promise<{
      results: {
        name: string;
      }[];
    }>;
  },
  component: () => {
    const data = peopleRoute.useLoaderData();
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    );
  },
});
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...

const queryClient = new QueryClient();

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
});
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from "@tanstack/react-query";

import "./App.css";

function App() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  });

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
npm install @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

function App() {
  const count = useStore(countStore);
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  );
}

export default App;
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store, Derived } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
});
doubledStore.mount();

function App() {
  const count = useStore(countStore);
  const doubledCount = useStore(doubledStore);

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  );
}

export default App;
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
