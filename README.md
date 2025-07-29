# Job Order Management

## Description 

The **Job Order Management** helps users efficiently manage their job orders and related data, including Jobs and Clients. Users can create, edit, and delete Jobs, Clients, and Orders to suit their business needs. Each Order includes a **status** and a **due_day**, allowing users to stay organized and focused on specific tasks. Additionally, users can add notes to each Client's profile to keep track of special requirements or preferences for future reference.

## Table Of Contents 

- [Work Environment](#work-environment)

- [Login/Register](#loginregister)

- [Home](#home)

- [Profile](#profile)

- [Job Card](#job-card)

- [Client Card](#client-card)

- [Create New Job](#create-new-job)

- [Create New Client](#create-new-client)

- [Orders List](#orders-list)
  

## Work Environment  

The **Job Order Management** is a full-stack web application built with **React** on the front end and **Flask** (Python) on the back end. On the front end, it utilizes the **useContext** hook to manage and share Jobs and User data across multiple components, enabling smooth and centralized state management.

On the back end, the app is powered by the **Flask** framework, along with key tools such as **SQLAlchemy** for database interaction and **Marshmallow** for data serialization and validation.

The development servers run on different ports:

 - The back end runs on port **5555**

 - The front end runs on port **3000**

As a result, the app's pages can be accessed locally at the following URLs:  

 - Signupt: - <http://localhost:3000/register>

 - Login: -<http://localhost:3000/login>

 - Home: - <http://localhost:3000/home>

 - User Profile: -<http://localhost:3000/profile> 

## Login/Register

When a user opens the app in the browser, the first screen they see is the **Register** page with a registration form. New users can fill out the form with a **valid username**, **email address**, and matching **password** and **password confirmation** to create an account.

If the user already has an account, they can simply click on the Login option and sign in using their existing username and password.

## Home

After logging into the **Job Order Management**, the user is redirected to the **Home page**. At the top of the page, a personalized message—"*Welcome, [Username]*"—is displayed, followed by a **Create New Job** button. The navigation bar at the top of the website contains two buttons: **Profile** and **Sign Out**, with the **Profile** button is highlighted to indicate the current page.

Below the button is a list of job cards on the market. Each card displays a **Job Title**, along with two buttons: **View Details** and **Create Order**.

 * Clicking **Create New Job** takes the user to the /new_job route, where they can add a new job.

 * Clicking **View Details** navigates to a page that shows more detailed information about the selected job.

 * Clicking **Create Order** also redirects the user to the /new_job route, allowing them to create an order associated with that job.

## Profile

When the user clicks the **Profile** button in the navigation bar, they are redirected to the **Profile page**. At the same time, the **Profile** button in the navigation bar changes to **Home**, allowing the user to navigate back.

At the top of the **Profile page**, the same personalized welcome message—“Welcome, [Username]”—is displayed. Below it are three buttons: **Show My Jobs**, **Show My Clients**, and **Create**. By default, the **Show My Jobs** button is highlighted when the user first lands on the page, and the highlight switches depending on which button is clicked.

A list of the user's own job cards is displayed below these buttons. When the user hovers over a job card, it animates slightly to indicate that it is active or focused.

## Job Card

There are two types of Job Cards in the app—one displayed on the **Home** page and the other on the **Profile** page.

🏠 **Home Page – Job Card**
The Home page job card is minimal and displays only the job *Title* along with two buttons: *View Details* and *Create Order*.

 - Clicking **View Details** navigates the user to a separate **Job Details** page where more information about the selected job is shown.

 - At the bottom of the **Job Details** page, there are two buttons: **Back To Profile** and **Create Order**.

   - **Back To Profile** returns the user to the **Profile** page. 

   - **Create Order** directs the user to the **Create New Order** page.


👤 **Profile Page – Job Card**
The **Profile** page displays more advanced job cards that contain the same detailed information shown on the **Job Details** page, with additional features:

 - At the bottom of each card, there is a *list of clients* who have placed orders for that job. Each client name is clickable and redirects the user to that client's detailed          information page.

 - Below the client list, there are two buttons:

   - **View Orders** – navigates to the Orders page for that specific job.

   - **Trash** – deletes the job from the user's personal list.

     - Note: Deleting a job from the profile removes it only from the user’s own jobs—it does **not** remove it from the general job list available on the market.

 - When the user hovers over a job card, an **Edit** button appears in the top-left corner.

   - Clicking Edit navigates to the Edit Job page.

   - **Note:** Editing a job will apply changes to the job universally—whether it's viewed in the market or in the user's profile.

## Client Card  

When a user clicks the **Show My Clients** button on the **Profile** page, a list of client cards is displayed. These cards are visually similar to the job cards, but instead show client-specific information.

Each client card includes a *list of jobs* that the client has ordered—note that this is not a *list of clients*, but rather a list of related jobs. Each job in the list is clickable, and selecting one displays detailed information about the chosen client.

At the bottom of each client card are two buttons:

 - **View Orders**-navigates to the list of orders associated with that specific client.

 - **Trash**-deletes the client.

> **Important:** Since the client list belongs exclusively to the user, deleting a client will **permanently remove** that client from the entire system—not just from the user's profile.

## Create New Job

➕ Creating a **New Job**
There are two ways for a user to create a new job in the **Job Order Management**:

From the **Home Page**:
On the **Home** page, directly below the welcome message, there is a **Create New Job** button. Clicking this button takes the user to the **Create New Job** page.

From the **Profile Page**:
On the **Profile** page, there is a **Create** button. Clicking it reveals a dropdown menu with two options: **New Job** and **New Client**. Selecting **New Job** also navigates the user to the **Create New Job** page.

📝 **Create New Job** page
On the **Create New Job** page, the user is presented with a form containing labeled fields to enter all the necessary details about the job.

At the top of the form is a **Back to Profile** button, which takes the user back to the **Profile** page.

At the bottom of the form are two buttons:

 - **Cancel** – navigates the user back to the **Profile** page.

 - **Create Job** – submits the form and redirects the user to the **Home** page, where the newly created job will appear.

## Create new Client

➕ **Creating a New Client**
Creating a new client follows the same process as creating a new job, with a few key differences.

To create a new client, the user should click the **Create** button located just below the welcome message on the **Profile** page. From the dropdown menu that appears, selecting **New Client** navigates the user to the **Create New Client** page.

On this page, the user is presented with a form containing fields for all the necessary information about the new client.

At the bottom of the form are three buttons:

 - **Back to Profile**

 - **Cancel**

 - **Create Client**

All three buttons redirect the user to the **Profile** page. However:

 - **Back to Profile** and **Cancel** return the user without saving any new data.

 - **Create Client** submits the form and adds the new client to the user’s client list.


## Orders List

📋 **Viewing the Orders List**
There are two ways to view an **Orders List** in the **Job Order Management**, depending on whether the orders are related to a **job** or a **client**.


1. 🧰 **Orders List for a Specific Job**
To view orders associated with a particular job:

    - Navigate to the **Profile** page and click the **Show My Jobs** button.

    - A list of job cards will appear, each with a **View Orders** button at the bottom.

    - Clicking this button takes the user to a page displaying all orders related to that job.


2. 👤 **Orders List for a Specific Client**
To view orders associated with a specific client:

    - From the **Profile** page, click the **Show My Clients** button.

    - A list of client cards will be displayed, each also containing a **View Orders** button.

    - Clicking this button takes the user to a page listing all orders placed by that client.


🧾 **Order Card Details**
Each **Order Card** displays all the essential information about the order, including:

  - The **status** of the order, which is highlighted in different colors to visually represent its current state (e.g., pending, in progress, completed).

  - The **Due Date**, which is shown in **red** to immediately draw the user's attention.

  - A **Delete** button is located at the bottom of the card.

    - If the order's status is **"in progress"**, the **Delete** button is **disabled** to prevent accidental removal.

    - For all other statuses, the button remains enabled and allows the user to delete the order.