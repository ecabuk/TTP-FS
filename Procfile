release: env PYTHONPATH=$PYTHONPATH:$PWD/app python app/manage.py migrate && python app/manage.py updatestocks
web: gunicorn --pythonpath app ttp_fs.wsgi --log-file -