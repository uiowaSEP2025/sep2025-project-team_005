from django import forms
from .models import Post, User

class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True  # Allows multiple files to be selected

class MultipleFileField(forms.FileField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleFileInput())
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        """Override to handle cleaning multiple files"""
        single_file_clean = super().clean
        if isinstance(data, (list, tuple)):  # Handling if multiple files are uploaded
            result = [single_file_clean(d, initial) for d in data]
        else:
            result = [single_file_clean(data, initial)]  # Handle the single file case
        return result

class PostForm(forms.ModelForm):
    files = MultipleFileField()
    tagged_users = forms.ModelMultipleChoiceField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Post
        fields = ['caption', 'files', 'tagged_users']

    def clean_files(self):
        """Custom clean method for file_field"""
        files = self.cleaned_data.get('files')
        if not files:
            raise forms.ValidationError("No files uploaded.")
        
        for file in files:
            file_type = file.content_type
            # Ensure only image and video files are allowed
            if not (file_type.startswith('image/') or file_type.startswith('video/')):
                raise forms.ValidationError("Only image and video files are allowed.")
        return files
