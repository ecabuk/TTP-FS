from django import forms
from django.contrib.auth import authenticate
from .models import User


class RegistrationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('name', 'email', 'password')
        widgets = {
            'name': forms.TextInput(attrs={'autocomplete': 'name'}),
            'password': forms.PasswordInput(),
            'email': forms.EmailInput(attrs={'autocomplete': 'email'}),
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        try:
            User.objects.get(email=email)
        except User.DoesNotExist:
            return email

        raise forms.ValidationError("Email is already in use.")

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user


class LoginForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={'autofocus': True}))
    password = forms.CharField(strip=False, widget=forms.PasswordInput)

    def clean(self):
        email = self.cleaned_data.get('email')
        password = self.cleaned_data.get('password')

        if email is not None and password:
            self.user_cache = authenticate(self.request, username=email, password=password)
            if self.user_cache is None:
                raise forms.ValidationError("Please enter a correct email and password.")

        return self.cleaned_data

    def get_user(self):
        return self.user_cache
