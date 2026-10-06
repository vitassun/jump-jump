#import "ViewController.h"

@interface ViewController ()
@property (strong, nonatomic) UIImpactFeedbackGenerator *lightFeedback;
@property (strong, nonatomic) UIImpactFeedbackGenerator *mediumFeedback;
@property (strong, nonatomic) UIImpactFeedbackGenerator *heavyFeedback;
@property (strong, nonatomic) UINotificationFeedbackGenerator *notificationFeedback;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Background color matching WeChat Jump scene
    UIColor *bgColor = [UIColor colorWithRed:220.0/255.0 green:233.0/255.0 blue:242.0/255.0 alpha:1.0];
    self.view.backgroundColor = bgColor;

    // Initialize Haptic Generators for crisp native iOS tactile response
    self.lightFeedback = [[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleLight];
    self.mediumFeedback = [[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleMedium];
    self.heavyFeedback = [[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleHeavy];
    self.notificationFeedback = [[UINotificationFeedbackGenerator alloc] init];

    // Configure WKWebView
    WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc] init];
    config.allowsInlineMediaPlayback = YES;
    config.mediaTypesRequiringUserActionForPlayback = WKAudiovisualMediaTypeNone;
    
    WKUserContentController *contentController = [[WKUserContentController alloc] init];
    [contentController addScriptMessageHandler:self name:@"haptic"];
    config.userContentController = contentController;

    // Enable local file access
    @try {
        [config.preferences setValue:@YES forKey:@"allowFileAccessFromFileURLs"];
    } @catch (NSException *exception) {}

    self.webView = [[WKWebView alloc] initWithFrame:self.view.bounds configuration:config];
    self.webView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    self.webView.navigationDelegate = self;
    self.webView.backgroundColor = bgColor;
    self.webView.opaque = YES;
    
    // Disable web bounces and scrollbars
    self.webView.scrollView.bounces = NO;
    self.webView.scrollView.scrollEnabled = NO;
    self.webView.scrollView.showsVerticalScrollIndicator = NO;
    self.webView.scrollView.showsHorizontalScrollIndicator = NO;
    self.webView.scrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;

    [self.view addSubview:self.webView];

    // Load offline bundled index.html
    [self loadGame];
}

- (void)loadGame {
    NSURL *bundleURL = [[NSBundle mainBundle] bundleURL];
    NSURL *indexURL = [bundleURL URLByAppendingPathComponent:@"www/index.html"];

    if (![[NSFileManager defaultManager] fileExistsAtPath:[indexURL path]]) {
        // Fallback check root bundle
        indexURL = [bundleURL URLByAppendingPathComponent:@"index.html"];
    }

    if ([[NSFileManager defaultManager] fileExistsAtPath:[indexURL path]]) {
        [self.webView loadFileURL:indexURL allowingReadAccessToURL:bundleURL];
    } else {
        NSLog(@"Error: index.html not found in bundle at path: %@", [indexURL path]);
    }
}

#pragma mark - WKScriptMessageHandler

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    if ([message.name isEqualToString:@"haptic"]) {
        NSString *type = @"light";
        if ([message.body isKindOfClass:[NSDictionary class]]) {
            type = message.body[@"type"] ?: @"light";
        } else if ([message.body isKindOfClass:[NSString class]]) {
            type = (NSString *)message.body;
        }

        dispatch_async(dispatch_get_main_queue(), ^{
            if ([type isEqualToString:@"light"]) {
                [self.lightFeedback prepare];
                [self.lightFeedback impactOccurred];
            } else if ([type isEqualToString:@"medium"]) {
                [self.mediumFeedback prepare];
                [self.mediumFeedback impactOccurred];
            } else if ([type isEqualToString:@"heavy"]) {
                [self.heavyFeedback prepare];
                [self.heavyFeedback impactOccurred];
            } else if ([type isEqualToString:@"success"]) {
                [self.notificationFeedback prepare];
                [self.notificationFeedback notificationOccurred:UINotificationFeedbackTypeSuccess];
            } else if ([type isEqualToString:@"error"]) {
                [self.notificationFeedback prepare];
                [self.notificationFeedback notificationOccurred:UINotificationFeedbackTypeError];
            }
        });
    }
}

#pragma mark - Status Bar & Home Indicator

- (BOOL)prefersStatusBarHidden {
    return YES;
}

- (BOOL)prefersHomeIndicatorAutoHidden {
    return YES;
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations {
    return UIInterfaceOrientationMaskPortrait;
}

@end
