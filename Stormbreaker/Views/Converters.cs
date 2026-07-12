using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;
using System.Windows.Media;

namespace Stormbreaker.Views
{
    public class ActiveViewToBrushConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string currentView && parameter is string targetView && currentView == targetView)
            {
                // Active gradient background
                var brush = new LinearGradientBrush
                {
                    StartPoint = new Point(0, 0),
                    EndPoint = new Point(1, 1)
                };
                brush.GradientStops.Add(new GradientStop(Color.FromArgb(50, 59, 130, 246), 0.0)); // 59, 130, 246 is #3b82f6 (blue)
                brush.GradientStops.Add(new GradientStop(Color.FromArgb(38, 139, 92, 246), 1.0));  // 139, 92, 246 is #8b5cf6 (purple)
                return brush;
            }
            return Brushes.Transparent;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class ActiveViewToBorderBrushConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string currentView && parameter is string targetView && currentView == targetView)
            {
                return new SolidColorBrush(Color.FromArgb(51, 0, 212, 255)); // #3300d4ff (cyan with 20% opacity)
            }
            return Brushes.Transparent;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class ActiveViewToForegroundConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string currentView && parameter is string targetView && currentView == targetView)
            {
                return new SolidColorBrush(Color.FromRgb(0, 212, 255)); // #00d4ff (cyan)
            }
            return new SolidColorBrush(Color.FromArgb(90, 232, 236, 244)); // TextMutedBrush
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class SeverityToBrushConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string severity)
            {
                return severity.ToLowerInvariant() switch
                {
                    "critical" or "red" => new SolidColorBrush(Color.FromRgb(239, 68, 68)),      // #ef4444 (red)
                    "warning" or "orange" => new SolidColorBrush(Color.FromRgb(245, 158, 11)),   // #f59e0b (orange)
                    "info" or "blue" => new SolidColorBrush(Color.FromRgb(59, 130, 246)),         // #3b82f6 (blue)
                    "success" or "green" => new SolidColorBrush(Color.FromRgb(34, 197, 94)),      // #22c55e (green)
                    "purple" => new SolidColorBrush(Color.FromRgb(139, 92, 246)),                 // #8b5cf6 (purple)
                    "pink" => new SolidColorBrush(Color.FromRgb(244, 114, 182)),                   // #f472b6 (pink)
                    _ => new SolidColorBrush(Color.FromRgb(232, 236, 244))                        // primary text
                };
            }
            return new SolidColorBrush(Color.FromRgb(232, 236, 244));
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class SeverityToBackplateConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string severity)
            {
                return severity.ToLowerInvariant() switch
                {
                    "critical" => new SolidColorBrush(Color.FromArgb(36, 239, 68, 68)),   // 14% opacity red
                    "warning" => new SolidColorBrush(Color.FromArgb(36, 245, 158, 11)),   // 14% opacity orange
                    "info" => new SolidColorBrush(Color.FromArgb(36, 59, 130, 246)),      // 14% opacity blue
                    "success" => new SolidColorBrush(Color.FromArgb(36, 34, 197, 94)),    // 14% opacity green
                    _ => new SolidColorBrush(Color.FromArgb(20, 255, 255, 255))
                };
            }
            return new SolidColorBrush(Color.FromArgb(20, 255, 255, 255));
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class BooleanToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return (value is bool b && b) ? Visibility.Visible : Visibility.Collapsed;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value is Visibility v && v == Visibility.Visible;
        }
    }

    public class InverseBooleanToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return (value is bool b && !b) ? Visibility.Visible : Visibility.Collapsed;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value is Visibility v && v != Visibility.Visible;
        }
    }

    public class IconNameToResourceConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string iconName)
            {
                return Application.Current.TryFindResource(iconName) ?? DependencyProperty.UnsetValue;
            }
            return DependencyProperty.UnsetValue;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
