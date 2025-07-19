#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc
from datetime import date, timedelta

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db, User, Client, Job, Order

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        
        # Clear existing data
        print("Clearing existing data...")
        Order.query.delete()
        Job.query.delete()
        Client.query.delete()
        User.query.delete()
        
        # Create users
        print("Creating users...")
        users = []
        user_data = [
            {"username": "john_doe", "email": "john.doe@email.com", "password": "password123"},
            {"username": "jane_smith", "email": "jane.smith@email.com", "password": "password123"},
            {"username": "mike_wilson", "email": "mike.wilson@email.com", "password": "password123"},
            {"username": "sarah_jones", "email": "sarah.jones@email.com", "password": "password123"},
            {"username": "alex_brown", "email": "alex.brown@email.com", "password": "password123"}
        ]
        
        for user_info in user_data:
            user = User(
                username=user_info["username"],
                email=user_info["email"]
            )
            user.set_password(user_info["password"])
            users.append(user)
            db.session.add(user)
        
        db.session.commit()
        print(f"Created {len(users)} users")
        
        # Create clients
        print("Creating clients...")
        clients = []
        client_data = [
            {
                "name": "TechStart Inc.",
                "email": "contact@techstart.com",
                "phone": "555-010-1001",
                "company": "TechStart Inc.",
                "address": "123 Innovation Drive, San Francisco, CA 94105",
                "notes": "Startup company looking for web development services. They need a modern, responsive website with e-commerce functionality. Budget is flexible but they prefer cost-effective solutions."
            },
            {
                "name": "Design Studio Pro",
                "email": "hello@designstudiopro.com",
                "phone": "555-010-1002",
                "company": "Design Studio Pro",
                "address": "456 Creative Avenue, New York, NY 10001",
                "notes": "Creative design agency that frequently needs graphic design work. They have ongoing projects and are looking for reliable freelancers who can meet tight deadlines."
            },
            {
                "name": "Local Restaurant Chain",
                "email": "manager@localrestaurant.com",
                "phone": "555-010-1003",
                "company": "Local Restaurant Chain",
                "address": "789 Food Street, Austin, TX 73301",
                "notes": "Family-owned restaurant chain expanding to new locations. They need marketing materials, menu designs, and promotional content. Very particular about brand consistency."
            },
            {
                "name": "E-commerce Startup",
                "email": "founder@ecommercestartup.com",
                "phone": "555-010-1004",
                "company": "E-commerce Startup",
                "address": "321 Digital Boulevard, Seattle, WA 98101",
                "notes": "New e-commerce platform launching soon. Need comprehensive digital marketing strategy, social media management, and content creation. Looking for long-term partnership."
            },
            {
                "name": "Real Estate Agency",
                "email": "info@realestateagency.com",
                "phone": "555-010-1005",
                "company": "Real Estate Agency",
                "address": "654 Property Lane, Miami, FL 33101",
                "notes": "Established real estate agency needing professional photography, virtual tours, and marketing materials for property listings. High volume of work available."
            },
            {
                "name": "Healthcare Clinic",
                "email": "admin@healthcareclinic.com",
                "phone": "555-010-1006",
                "company": "Healthcare Clinic",
                "address": "987 Medical Center Drive, Chicago, IL 60601",
                "notes": "Medical clinic requiring website redesign, patient portal development, and HIPAA-compliant digital solutions. Strict security requirements."
            },
            {
                "name": "Educational Institute",
                "email": "contact@eduinst.com",
                "phone": "555-010-1007",
                "company": "Educational Institute",
                "address": "147 Learning Street, Boston, MA 02101",
                "notes": "Online education platform needing course content creation, video production, and learning management system development. Educational background preferred."
            },
            {
                "name": "Fitness Center",
                "email": "hello@fitnesscenter.com",
                "phone": "555-010-1008",
                "company": "Fitness Center",
                "address": "258 Health Avenue, Los Angeles, CA 90001",
                "notes": "Gym and fitness center looking for mobile app development, social media marketing, and promotional video content. Target audience is health-conscious millennials."
            }
        ]
        
        for client_info in client_data:
            client = Client(
                name=client_info["name"],
                email=client_info["email"],
                phone=client_info["phone"],
                company=client_info["company"],
                address=client_info["address"],
                notes=client_info["notes"],
                user_id=rc(users).id  # Assign a random user to each client
            )
            clients.append(client)
            db.session.add(client)
        
        db.session.commit()
        print(f"Created {len(clients)} clients")
        
        # Create jobs
        print("Creating jobs...")
        jobs = []
        job_data = [
            {
                "title": "Web Development",
                "category": "Technology",
                "description": "Full-stack web development including frontend, backend, database design, and deployment. Technologies include React, Node.js, and PostgreSQL.",
                "duration": "40-80 hours"
            },
            {
                "title": "Graphic Design",
                "category": "Creative",
                "description": "Professional graphic design services including logos, branding materials, social media graphics, and print collateral. Adobe Creative Suite expertise required.",
                "duration": "10-30 hours"
            },
            {
                "title": "Digital Marketing",
                "category": "Marketing",
                "description": "Comprehensive digital marketing strategy including SEO, social media management, content creation, and email marketing campaigns.",
                "duration": "20-50 hours"
            },
            {
                "title": "Mobile App Development",
                "category": "Technology",
                "description": "Native and cross-platform mobile app development for iOS and Android. Includes UI/UX design, development, testing, and app store submission.",
                "duration": "60-120 hours"
            },
            {
                "title": "Content Writing",
                "category": "Writing",
                "description": "Professional content writing including blog posts, website copy, marketing materials, and technical documentation. SEO-optimized content creation.",
                "duration": "5-20 hours"
            },
            {
                "title": "Video Production",
                "category": "Media",
                "description": "Professional video production including filming, editing, post-production, and distribution. Corporate videos, promotional content, and social media videos.",
                "duration": "15-40 hours"
            },
            {
                "title": "Photography",
                "category": "Media",
                "description": "Professional photography services including product photography, real estate photography, event coverage, and portrait sessions. High-quality equipment and editing included.",
                "duration": "2-8 hours"
            },
            {
                "title": "UI/UX Design",
                "category": "Design",
                "description": "User interface and user experience design for web and mobile applications. Includes wireframing, prototyping, user research, and usability testing.",
                "duration": "25-60 hours"
            }
        ]
        
        for job_info in job_data:
            job = Job(
                title=job_info["title"],
                category=job_info["category"],
                description=job_info["description"],
                duration=job_info["duration"]
            )
            jobs.append(job)
            db.session.add(job)
        
        db.session.commit()
        print(f"Created {len(jobs)} jobs")
        
        # Create orders
        print("Creating orders...")
        orders = []
        order_data = [
            {
                "description": "Develop a modern e-commerce website with shopping cart functionality, payment integration, and admin dashboard",
                "location": "Remote work with client meetings in San Francisco, CA",
                "start_date": date.today() + timedelta(days=5),
                "due_date": date.today() + timedelta(days=45),
                "status": "pending",
                "rate": "$75 per hour"
            },
            {
                "description": "Create brand identity package including logo design, business cards, letterhead, and brand guidelines",
                "location": "Client office in New York, NY for initial meeting, then remote work",
                "start_date": date.today() + timedelta(days=2),
                "due_date": date.today() + timedelta(days=22),
                "status": "in progress",
                "rate": "$50 per hour"
            },
            {
                "description": "Implement comprehensive SEO strategy including keyword research, on-page optimization, and content marketing plan",
                "location": "Fully remote work with weekly video calls",
                "start_date": date.today() - timedelta(days=10),
                "due_date": date.today() + timedelta(days=20),
                "status": "completed",
                "rate": "$60 per hour"
            },
            {
                "description": "Build native iOS app for restaurant ordering system with real-time order tracking and payment processing",
                "location": "Hybrid work - initial meetings in Los Angeles, CA, then remote development",
                "start_date": date.today() + timedelta(days=15),
                "due_date": date.today() + timedelta(days=75),
                "status": "pending",
                "rate": "$85 per hour"
            },
            {
                "description": "Write 20 blog posts for tech startup covering industry trends, product updates, and thought leadership content",
                "location": "Remote work with content review meetings via Zoom",
                "start_date": date.today() - timedelta(days=5),
                "due_date": date.today() + timedelta(days=15),
                "status": "in progress",
                "rate": "$40 per hour"
            },
            {
                "description": "Produce promotional video for new product launch including filming, editing, and post-production effects",
                "location": "On-site filming in Austin, TX, editing work remote",
                "start_date": date.today() + timedelta(days=8),
                "due_date": date.today() + timedelta(days=28),
                "status": "pending",
                "rate": "$70 per hour"
            },
            {
                "description": "Photograph 50 properties for real estate listings including interior, exterior, and aerial drone shots",
                "location": "Various properties across Miami, FL area",
                "start_date": date.today() - timedelta(days=3),
                "due_date": date.today() + timedelta(days=7),
                "status": "completed",
                "rate": "$55 per hour"
            },
            {
                "description": "Design user interface for healthcare patient portal with focus on accessibility and ease of use",
                "location": "Remote work with stakeholder meetings in Chicago, IL",
                "start_date": date.today() + timedelta(days=12),
                "due_date": date.today() + timedelta(days=42),
                "status": "pending",
                "rate": "$65 per hour"
            },
            {
                "description": "Develop WordPress website with custom theme and plugin development for educational institute",
                "location": "Remote work with training sessions at client location in Seattle, WA",
                "start_date": date.today() - timedelta(days=20),
                "due_date": date.today() - timedelta(days=5),
                "status": "completed",
                "rate": "$75 per hour"
            },
            {
                "description": "Create social media marketing campaign including content calendar, graphics, and community management",
                "location": "Fully remote work with daily communication via Slack",
                "start_date": date.today() + timedelta(days=1),
                "due_date": date.today() + timedelta(days=31),
                "status": "in progress",
                "rate": "$60 per hour"
            }
        ]
        
        for order_info in order_data:
            selected_client = rc(clients)
            order = Order(
                description=order_info["description"],
                location=order_info["location"],
                start_date=order_info["start_date"],
                due_date=order_info["due_date"],
                status=order_info["status"],
                rate=order_info["rate"],
                user_id=selected_client.user_id,  # Use the client's user_id
                client_id=selected_client.id,
                job_id=rc(jobs).id
            )
            orders.append(order)
            db.session.add(order)
        
        db.session.commit()
        print(f"Created {len(orders)} orders")
        
        print("Seed completed successfully!")
        print(f"Total records created:")
        print(f"- Users: {len(users)}")
        print(f"- Clients: {len(clients)}")
        print(f"- Jobs: {len(jobs)}")
        print(f"- Orders: {len(orders)}")
