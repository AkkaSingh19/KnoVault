from django.db import models
from django.contrib.auth.models import User, AbstractUser


class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)  # no longer unique

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        constraints = [] 

class Document(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='documents/')
    original_filename = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    failure_reason = models.CharField(max_length=255, blank=True, null=True)
    page_count = models.PositiveIntegerField(default=0)
    chunk_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.original_filename


class Chunk(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    text = models.TextField()
    page_number = models.PositiveIntegerField()
    chunk_index = models.PositiveIntegerField()  

    class Meta:
        ordering = ['chunk_index']


class ChatMessage(models.Model):
    ROLE_CHOICES = [('user', 'User'), ('assistant', 'Assistant')]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    source_pages = models.JSONField(default=list, blank=True)  
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class Artifact(models.Model):
    KIND_CHOICES = [
        ('summary', 'Summary'),
        ('keywords', 'Keywords'),
        ('study_notes', 'Study Notes'),
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='artifacts')
    kind = models.CharField(max_length=20, choices=KIND_CHOICES)
    content = models.JSONField()  
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('document', 'kind')