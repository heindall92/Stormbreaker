using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace Stormbreaker
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            DataContext = new ViewModels.MainViewModel();
        }

        protected override void OnKeyDown(KeyEventArgs e)
        {
            base.OnKeyDown(e);

            // Avoid triggering shortcuts if the user is currently typing in an input control
            if (e.OriginalSource is TextBox || e.OriginalSource is PasswordBox || e.OriginalSource is ComboBox)
                return;

            // ESC closes the import modal overlay
            if (e.Key == Key.Escape)
            {
                if (DataContext is ViewModels.MainViewModel vm)
                {
                    vm.IsImportModalOpen = false;
                }
            }

            // Keyboard keys 1 to 8 navigate between the 8 main views
            int num = 0;
            if (e.Key >= Key.D1 && e.Key <= Key.D8)
            {
                num = e.Key - Key.D1 + 1;
            }
            else if (e.Key >= Key.NumPad1 && e.Key <= Key.NumPad8)
            {
                num = e.Key - Key.NumPad1 + 1;
            }

            if (num >= 1 && num <= 8)
            {
                if (DataContext is ViewModels.MainViewModel vm)
                {
                    string[] views = { "dashboard", "events", "mft", "timeline", "correlation", "ai", "reports", "settings" };
                    vm.CurrentView = views[num - 1];
                }
            }
        }
    }
}