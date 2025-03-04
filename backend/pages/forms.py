from django import forms
from .models import Post
from .models import User

class PostForm(forms.ModelForm):
    file = forms.FileField(required=True)
    tagged_users = forms.ModelMultipleChoiceField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Post
        fields = ['caption', 'file', 'tagged_users']

    def clean_file(self):
        file = self.cleaned_data.get('file')
        file_type = file.content_type

        if not (file_type.startswith('image/') or file_type.startswith('video/')):
            raise forms.ValidationError("Only image and video files are allowed.")
        
        return file
