release: python app/manage.py migrate && python app/manage.py updatestocks
web: gunicorn app.ttp_fs.wsgi --log-file -