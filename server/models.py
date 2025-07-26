from marshmallow import validates, ValidationError, post_load, fields
from marshmallow_sqlalchemy import auto_field
from datetime import date
from config import db, bcrypt, ma

class User(db.Model):
  __tablename__ = 'users'
  id = db.Column(db.Integer, primary_key=True)
  username = db.Column(db.String(30), unique=True, nullable=False)
  email = db.Column(db.String(60), unique=True, nullable=False)
  _password_hash = db.Column(db.String, nullable=False)

  clients = db.relationship('Client', backref='user', cascade="all, delete")
  orders = db.relationship('Order', backref='user', cascade="all, delete")
  jobs = db.relationship('Job', 
                          secondary='orders', 
                          primaryjoin='User.id == Order.user_id',
                          secondaryjoin='Job.id == Order.job_id',
                          viewonly=True)
  
  def set_password(self, password):
      if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
      password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
      self._password_hash = password_hash.decode('utf-8')

  def authenticate(self, password):
      return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))  
  
  def __repr__(self):
      return f"<User {self.username}>" 

class Client(db.Model):
  __tablename__ = 'clients'
  
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(30), nullable=False)
  email = db.Column(db.String(60), nullable=False)
  phone = db.Column(db.String(12), nullable=False) 
  company = db.Column(db.String(100), nullable=True)
  address = db.Column(db.Text, nullable=True)
  notes = db.Column(db.Text, nullable=False)
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  
  orders = db.relationship('Order', backref='client')
  jobs = db.relationship('Job', secondary='orders', viewonly=True)
    
  def __repr__(self):
    return f'<Client {self.name}>'
  
class Job(db.Model):
  __tablename__ = 'jobs'

  id = db.Column(db.Integer, primary_key=True)
  title = db.Column(db.String(50), nullable=False)
  category = db.Column(db.String(50), nullable=False)
  description = db.Column(db.Text, nullable=False)
  duration = db.Column(db.String, nullable=False)

  orders = db.relationship('Order', backref='job', cascade='all, delete-orphan')
    
  def __repr__(self):
    return f'<Style {self.title}>' 

class Order(db.Model):
  __tablename__ = 'orders'

  id = db.Column(db.Integer, primary_key=True)
  description = db.Column(db.Text)
  rate = db.Column(db.String(20), nullable=False)  
  location = db.Column(db.Text, nullable=False)
  start_date = db.Column(db.Date, nullable=False)
  due_date = db.Column(db.Date, nullable = False)
  status = db.Column(db.String(20), nullable=False, default='pending')

  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
  job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)

  def __repr__(self):
     return f'<Order {self.status}>'
   
class UserSchema(ma.SQLAlchemyAutoSchema):
  class Meta:
    model = User
    load_instance = False  # @post_load is always called for password hashing
    exclude = ('_password_hash',)

  username = auto_field(required=True)
  email = auto_field(required=True)
  password = fields.String(load_only=True, required=True)

  jobs = fields.Method('get_user_jobs', dump_only=True)
  clients = fields.Nested('ClientSchema', many=True, dump_only=True)
  orders = fields.Nested('OrderSchema', many=True, dump_only=True)

  def get_user_jobs(self, obj):
    jobs_with_clients = []
    for job in obj.jobs:
      job_data = {
        'id': job.id,
        'title': job.title,
        'category': job.category,
        'description': job.description,
        'duration': job.duration,
        'clients': []
      }
      
      for order in job.orders:
        if order.client.user_id == obj.id:  
          job_data['clients'].append({
            'id': order.client.id,
            'name': order.client.name,
            'email': order.client.email
          })
      
      jobs_with_clients.append(job_data)
    
    return jobs_with_clients


  @validates('email')
  def validate_email(self, value, **kargs):
    if '@' not in value or '.' not in value:
      raise ValidationError('Invalid email format')
    if len(value) < 5:
      raise ValidationError('Email must be at least 5 characters long')

  @validates('username')
  def validate_username(self, value, **kwargs):
    if len(value) < 2:
      raise ValidationError('Username must be at least 2 characters long')
    if not all(c.isalnum() or c.isspace() for c in value):
      raise ValidationError('Username must contain only letters, numbers, and spaces')

  @post_load
  def make_user(self, data, **kwargs):
    print('DEBUG make_user called with:', data)
    if isinstance(data, dict):
        password = data.pop('password', None)
        print('DEBUG password extracted:', password)
        if not password:
            raise ValidationError("Password is required for registration")
        user = User(**data)
        user.set_password(password)
        print('DEBUG user created:', user)
        return user
    return data
  
class JobSchema(ma.SQLAlchemyAutoSchema):
  class Meta:
    model = Job
    load_instance = True
    exclude = ('orders',)

  title = auto_field(required=True)
  category = auto_field(required=True)
  description = auto_field(required=True)
  duration = auto_field(required=True)

  clients = fields.Method('get_job_clients', dump_only=True)

  def get_job_clients(self, obj):

    clients = []
    for order in obj.orders:
      client_data = {
        'id': order.client.id,
        'name': order.client.name,
        'email': order.client.email
      }
      
      if client_data not in clients:
        clients.append(client_data)
    return clients
  
  def get_job_clients_for_user(self, obj, user_id):
    clients = []
    for order in obj.orders:
      if order.client.user_id == user_id:
        client_data = {
          'id': order.client.id,
          'name': order.client.name,
          'email': order.client.email
        }
        if client_data not in clients:
          clients.append(client_data)
    return clients

  @validates('title')
  def validate_title(self, value, **kwargs):
    if len(value) < 5:
      raise ValidationError('Job title must be at least 5 characters long')

  @validates('description')
  def validate_description(self, value, **kwargs):
    if len(value) < 10:
      raise ValidationError('Job description must be at least 10 characters long')  

class ClientSchema(ma.SQLAlchemyAutoSchema):
  class Meta:
    model = Client
    load_instance = True

  name = auto_field(required=True)
  email = auto_field(required=True)
  phone = auto_field(required=True)
  company = auto_field(required=False)
  address = auto_field(required=False)
  notes = auto_field(required=True)
  user_id = auto_field(required=True)
  
  jobs = fields.Method('get_client_jobs', dump_only=True)
  
  def get_client_jobs(self, obj):
    jobs_data = []
    if hasattr(obj, 'orders') and obj.orders:
      for order in obj.orders:
        if hasattr(order, 'job') and order.job:
          job_data = {
            'id': order.job.id,
            'title': order.job.title,
            'category': order.job.category,
            'description': order.job.description,
            'duration': order.job.duration
          }
          
          if job_data not in jobs_data:
            jobs_data.append(job_data)
    return jobs_data
  
  @validates('name')
  def validate_name(self, value, **kwargs):
    if not value or len(value.strip()) < 2:
      raise ValidationError('Client name must be at least 2 characters long')
    if len(value.strip()) > 30:
      raise ValidationError('Client name must be 30 characters or less')
    
    import re
    if not re.match(r'^[a-zA-Z0-9\s\-\'\.]+$', value.strip()):
      raise ValidationError('Client name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods')
    
  @validates('email')
  def validate_email(self, value, **kwargs):
    if not value or '@' not in value or '.' not in value:
      raise ValidationError('Invalid email format')
    if len(value) < 5:
      raise ValidationError('Email must be at least 5 characters long')
    
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, value):
      raise ValidationError('Invalid email format')
    
  @validates('phone')
  def validate_phone(self, value, **kwargs):
    if not value:
      raise ValidationError('Phone number is required')
   
    import re
    phone_pattern = r'^\d{3}-\d{3}-\d{4}$'
    if not re.match(phone_pattern, value):
      raise ValidationError('Phone number must be in format: ###-###-####')
    
  @validates('notes')
  def validate_notes(self, value, **kwargs):
    if not value or len(value.strip()) < 20:
      raise ValidationError('Client notes must be at least 20 characters long')
    if len(value.strip()) > 1000:
      raise ValidationError('Client notes must be 1000 characters or less')

class OrderSchema(ma.SQLAlchemyAutoSchema):
  class Meta:
    model = Order
    load_instance = True
    include_fk = True
    exclude = ('user',)

  id = auto_field(dump_only=True)
  description = auto_field(required=True)
  rate = auto_field(required=True)
  location = auto_field(required=True)
  start_date = auto_field(required=True)
  due_date = auto_field(required=True)
  status = auto_field(required=True)

  user_id = auto_field(required=True)
  client_id = auto_field(required=True)
  job_id = auto_field(required=True)

  client = fields.Nested('ClientSchema', dump_only=True)
  job = fields.Nested('JobSchema', dump_only=True)

  @validates('description')
  def validate_description(self, value, **kwargs):
    if len(value.strip()) < 5:
      raise ValidationError('Order description must be at least 5 characters long')
    
  @validates('rate')
  def validate_rate(self, value, **kwargs):
    if len(value) < 10:
      raise ValidationError('Job rate must be at least 10 characters long')
    
  @validates('location')
  def validate_location(self, value, **kwargs):
    if len(value.strip()) < 10:
      raise ValidationError('Order location must be at least 10 characters long')
    
  @validates('status')
  def validate_status(self, value, **kwargs):
    allowed_statuses = ['pending', 'in progress', 'completed', 'canceled']
    if value.lower() not in allowed_statuses:
      raise ValidationError(f"Status must be one of: {', '.join(allowed_statuses)}")

