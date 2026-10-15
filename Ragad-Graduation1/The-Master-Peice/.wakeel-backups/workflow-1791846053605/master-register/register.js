 (() => {
      'use strict';
      const form = document.getElementById('registerForm');
      const agent = document.getElementById('agent');
      
      document.querySelectorAll('.show-password').forEach(button => {
        button.addEventListener('click', () => {
          const input = document.getElementById(button.dataset.for);
          if (!input) return;
          const show = input.type === 'password';
          input.type = show ? 'text' : 'password';
          button.setAttribute('aria-pressed', String(show));
          button.setAttribute('aria-label', show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
        });
      });
      const validatePasswords = () => {
        confirm.setCustomValidity(confirm.value && password.value !== confirm.value ? 'كلمتا المرور غير متطابقتين.' : '');
      };
      password.addEventListener('input', validatePasswords);
      confirm.addEventListener('input', validatePasswords);
      form.addEventListener('submit', e => {
        e.preventDefault();
        validatePasswords();
        if (!form.reportValidity()) return;
        // No backend exists yet: don't fake registration or save a password locally.
        message.textContent = 'نموذج التسجيل جاهز. إنشاء الحساب الفعلي سيتاح بعد ربط الخادم.';
      });
    })();