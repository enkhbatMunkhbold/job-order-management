from flask import request, session
from flask_restful import Resource
from marshmallow.exceptions import ValidationError

from config import app, db, api
from models import User, Client, Job, Order, UserSchema, ClientSchema, JobSchema, OrderSchema

user_schema = UserSchema()
users_schema = UserSchema(many=True)
client_schema = ClientSchema()
clients_schema = ClientSchema(many=True)
job_schema = JobSchema()
jobs_schema = JobSchema(many=True)
order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

@app.route('/')
def index():
    return '<h1>Project Server</h1>'

class Register(Resource):
    def post(self):
        try: 
            data = request.get_json()
            if not data or not all(k in data for k in ['username', 'email', 'password']):
                return {'error': 'Missing required fields: username, email, and password are required'}, 400
            
            if User.query.filter_by(email=data['email']).first():
                return {'error': 'Email already exists'}, 400

            if User.query.filter_by(username=data['username']).first():
                return {'error': 'Username already exists'}, 400

            new_user = user_schema.load(data)
            db.session.add(new_user)
            db.session.commit()
            session['user_id'] = new_user.id

            return user_schema.dump(new_user), 201
        
        except ValidationError as e:
            return {'error': str(e)}, 400
        
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return {'error': f'An error occurred during registration: {str(e)}'}, 500
        
api.add_resource(Register, '/register')

class Login(Resource):
    def post(self):
        try:
            data = request.get_json()
            if not data or not all(k in data for k in ['username', 'password']):
                return {'error': 'Missing required fields'}, 400
            
            user = User.query.filter_by(username=data['username']).first()
            print('DEBUG: user found:', user)
            if not user:
                return {'message': 'Invalid credentials'}, 401

            print('DEBUG: user._password_hash:', user._password_hash)
            if not user._password_hash:
                return {'message': 'Invalid credentials'}, 401

            if user.authenticate(data['password']):
                session['user_id'] = user.id
                return user_schema.dump(user), 200
            
            return {'message': 'Invalid credentials'}, 401
        
        except Exception as e:
            return {'error': str(e)}, 500

api.add_resource(Login, '/login')

class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        if user_id:
            user = db.session.get(User, user_id)
            if user:
                user_data = user_schema.dump(user)
                return user_data, 200
            return {'error': 'Not authenticated'}, 401
        return {'error': 'Not authenticated'}, 401
        
api.add_resource(CheckSession, '/check_session')

class Logout(Resource):
    def delete(self):
        session.pop('user_id', None)
        return {}, 204
    
api.add_resource(Logout, '/logout')

class Clients(Resource):
    def get(self):
        try:
            user_id = session.get('user_id')
            if not user_id:
                return {'error': 'Not authenticated'}, 401
            
            user = db.session.get(User, user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            result = clients_schema.dump(user.clients)            
            return result, 200
        
        except Exception as e:
            print(f"Error in Clients.get(): {str(e)}")
            return {'error': f'Internal server error: {str(e)}'}, 500
    def post(self):
        try: 
            user_id = session.get('user_id')
            if not user_id:
                return {'error': 'Not authenticated'}, 401
            
            user = db.session.get(User, user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            data = request.get_json()
            data['user_id'] = user_id 
            new_client = client_schema.load(data)

            db.session.add(new_client)
            db.session.commit()

            return client_schema.dump(new_client), 201
        except ValidationError as ve:
            print(f"Validation error: {ve.messages}")
            return {'error': ve.messages}, 400
        except Exception as e:
            db.session.rollback()
            return ({'error': f'Internal server error: {str(e)}'}), 500
        
api.add_resource(Clients, '/clients')

class ClientById(Resource):
    def delete(self, client_id):
        try:
            user_id = session.get('user_id')
            if not user_id:
                return {'error': 'Not authenticated'}, 401
            
            client = Client.query.get(client_id)
            if not client:
                return {'error': 'Client not found'}, 404
            
            # Check if the client belongs to the authenticated user
            if client.user_id != user_id:
                return {'error': 'Unauthorized access to client'}, 403
            
            if client.orders:
                return {'error': 'Cannot delete client with existing order!'}, 400
            
            serialized_client = client_schema.dump(client)  
            try:      
                db.session.delete(client)
                db.session.commit()
                return {
                    'message': 'Client deleted successfully',
                    'deleted_client': serialized_client
                }, 200
            
            except Exception as e:
                db.session.rollback()
                return {'error': f'Internal server error {str(e)}'}, 500
                
        except Exception as e:
            return {'error': f'Internal server error: {str(e)}'}, 500
    
    def patch(self, client_id):        
        client = Client.query.get(client_id)

        if not client:
            return {'error': 'Client not found'}, 404
        
        try:
            data = request.get_json()
            if not data:
                return {'error': 'No data provided'}, 400

            updated_client = client_schema.load(data, instance=client, partial=True)
            db.session.commit()

            return client_schema.dump(updated_client), 200  

        except ValidationError as ve:
            return {'error': ve.messages}, 400
        except Exception as e:
            db.session.rollback()
            return {'error': f'Internal server error: {str(e)}'}, 500  
    
api.add_resource(ClientById, '/clients/<int:client_id>')

class ClientOrders(Resource):
    def get(self, client_id):
        try:
            user_id = session.get('user_id')
            if not user_id:
                return {'error': 'Not authenticated'}, 401
            
            client = Client.query.get(client_id)
            if not client:
                return {'error': 'Client not found'}, 404
            
            if client.user_id != user_id:
                return {'error': 'Unauthorized access to client'}, 403
            
            orders = Order.query.filter_by(client_id=client_id).all()
            orders_data = []
            for order in orders:
                order_data = order_schema.dump(order)
                order_data['job'] = job_schema.dump(order.job)
                orders_data.append(order_data)
            
            return {
                'client': client_schema.dump(client),
                'orders': orders_data
            }, 200
            
        except Exception as e:
            return {'error': f'Internal server error: {str(e)}'}, 500

api.add_resource(ClientOrders, '/clients/<int:client_id>/orders')

class Jobs(Resource):
    def get(self):
        try:
            jobs = Job.query.all()
            result = jobs_schema.dump(jobs)            
            return result, 200
        
        except Exception as e:
            print(f"Error in Jobs.get(): {str(e)}")
            return {'error': f'Internal server error: {str(e)}'}, 500
        
    def post(self):
        try:
            user_id = session.get('user_id')
            if not user_id:
                return {'error': 'Not authenticated'}, 401
            
            user = db.session.get(User, user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            data = request.get_json()
            print(f"Received job data: {data}")
            new_job = job_schema.load(data)

            db.session.add(new_job)
            db.session.commit()
            return job_schema.dump(new_job), 201
        
        except ValidationError as ve:
            print(f"Validation error: {ve.messages}")
            return {'error': ve.messages}, 400
        
        except Exception as e:
            db.session.rollback()
            return {'error': f'Internal server error {str(e)}'}, 400
    
api.add_resource(Jobs, '/jobs')

class JobById(Resource):
    def get(self, job_id):
        job = Job.query.get(job_id)

        if not job:
            return {'error': 'Job not found'}, 404
        
        return job_schema.dump(job), 200
    
    def delete(self, job_id):
        try:
            user_id = session.get('user_id')
            if not user_id:
                return {'error': 'Not authenticated'}, 401
            
            job = Job.query.get(job_id)
            if not job:
                return {'error': 'Job not found'}, 404
            
            user_orders = Order.query.filter_by(job_id=job_id, user_id=user_id).all()
            
            if not user_orders:
                return {'error': 'No orders found for this job'}, 404
            for order in user_orders:
                if order.status == 'in progress':
                    return {'error': 'Cannot remove job with active orders!'}, 400
            
            serialized_job = job_schema.dump(job)

            try:
                for order in user_orders:
                    db.session.delete(order)
                
                db.session.commit()

                return {
                    'message': 'Job removed from user successfully',
                    'removed_job': serialized_job
                }, 200
            
            except Exception as e:
                db.session.rollback()
                return {'error': f'Internal server error {str(e)}'}, 500
                
        except Exception as e:
            return {'error': f'Internal server error: {str(e)}'}, 500
    
    def patch(self, job_id):
        job = Job.query.get(job_id)

        if not job:
            return {'error': 'Job not found'}, 404
        
        try:
            data = request.get_json()

            if not data:
                return {'error': 'No data provided'}, 404

            updated_job = job_schema.load(data, instance=job, partial=True)
            db.session.commit()

            return job_schema.dump(updated_job), 200
        
        except ValidationError as ve:
            return {'error': ve.messages}, 400
        except Exception as e:
            db.session.rollback()
            return {'error': f'Internal server error {str(e)}'}, 500
    
api.add_resource(JobById, '/jobs/<int:job_id>')

class JobOrders(Resource):
    def get(self, job_id):
        try:
            user_id = session.get('user_id')
            if not user_id:
                return {'error': 'Not authenticated'}, 401

            job = Job.query.get(job_id)
            if not job:
                return {'error': "Job not found"}, 404
            
            orders = Order.query.filter_by(job_id=job_id, user_id=user_id).all()

            orders_data = []
            for order in orders:
                order_data = order_schema.dump(order)
                order_data['client'] = client_schema.dump(order.client)
                orders_data.append(order_data)
            
            return {
                'job': job_schema.dump(job),
                'orders': orders_data
            }, 200
        
        except Exception as e:
            return {'error': f'Internal server error: {str(e)}'}, 500
api.add_resource(JobOrders, '/jobs/<int:job_id>/orders')

class Orders(Resource):
    def post(self):
        try:
            user_id = session.get('user_id')
            if not user_id:
                return {'error': 'Not authenticated'}, 401
            
            user = db.session.get(User, user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            data = request.get_json()
            # Add user_id to the data before loading with schema
            data['user_id'] = user_id
            new_order = order_schema.load(data)

            db.session.add(new_order)
            db.session.commit()
            return order_schema.dump(new_order), 201
        
        except ValidationError as ve:
            return {'error': ve.messages}, 400
        except Exception as e:
            db.session.rollback()
            return {'error': f'Internal server error {str(e)}'}, 500
        
api.add_resource(Orders, '/orders')

class OrderById(Resource):
    
    def patch(self, order_id):
        try:
            user_id = session.get('user_id')
            if not user_id:
                return {'error': 'Not authenticated'}, 401
            
            order = Order.query.get(order_id)
            if not order:
                return {'error': 'Order not found'}, 404
            
            # Check if the order belongs to the authenticated user
            if order.user_id != user_id:
                return {'error': 'Unauthorized access to order'}, 403
            
            data = request.get_json()
            if not data:
                return {'error': 'No data provided'}, 400

            updated_order = order_schema.load(data, instance=order, partial=True)
            db.session.commit()

            return order_schema.dump(updated_order), 200

        except ValidationError as ve:
            return {'error': ve.messages}, 400
        except Exception as e:
            db.session.rollback()
            return {'error': f'Internal server error: {str(e)}'}, 500
    
    def delete(self, order_id):
        try:
            user_id = session.get('user_id')
            if not user_id:
                return {'error': 'Not authenticated'}, 401
            
            order = Order.query.get(order_id)
            if not order:
                return {'error': 'Order not found'}, 404
            
            if order.user_id != user_id:
                return {'error': 'Unauthorized access to order'}, 403
            
            serialized_order = order_schema.dump(order)

            db.session.delete(order)
            db.session.commit()

            return {
                'message': 'Order deleted successfully',
                'deleted_order': serialized_order
            }, 200
        
        except Exception as e:
            db.session.rollback()
            return {'error': f'Internal server error {str(e)}'}, 500
        
api.add_resource(OrderById, '/orders/<int:order_id>')

if __name__ == '__main__':
    app.run(port=5555, debug=True)

