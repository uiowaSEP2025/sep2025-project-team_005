from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    file = forms.FileField(required=True)

    class Meta:
        model = Post
        fields = ['caption', 'file']

    def clean_file(self):
        file = self.cleaned_data.get('file')
        file_type = file.content_type

        if not (file_type.startswith('image/') or file_type.startswith('video/')):
            raise forms.ValidationError("Only image and video files are allowed.")
        
        return file
